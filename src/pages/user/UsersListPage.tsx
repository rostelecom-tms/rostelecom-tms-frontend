import {Alert, App, Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Spin, Switch, Table, Tag, Typography} from "antd";
import type {ColumnsType} from "antd/es/table";
import {useMemo, useState} from "react";
import {
    useDeleteUser,
    useMe,
    useUsers,
    useCreateUser,
    useUpdateUser,
    useRegistrationRequests,
    useApproveRegistration,
    useRejectRegistration
} from "../../hooks/user/userHooks.ts";
import {useRoles} from "../../hooks/user/roleHooks.ts";
import {
    useAddProjectMember,
    useApproveProjectAccessRequest,
    useProjectAccessRequestInbox,
    useProjects,
    useRejectProjectAccessRequest,
    useRemoveProjectMember
} from "../../hooks/project/projectHooks.ts";
import type {IProjectAccessRequest} from "../../models/project/project.ts";
import type {IUser, IRegistrationRequest} from "../../models/user/user.ts";

const {Title, Text} = Typography

interface CreateUserFormValues {
    email: string
    username: string
    password: string
    roleId: number
    canCreateProjects: boolean
}

interface UpdateUserFormValues {
    roleId?: number
    canCreateProjects?: boolean
    projectIds: number[]
}

export const UsersListPage = () => {
    const {message} = App.useApp()
    const {data: me, isLoading: isMeLoading} = useMe()
    const {data: users, isLoading: isUsersLoading, isError: isUsersError} = useUsers()
    const {data: roles, isLoading: isRolesLoading, isError: isRolesError} = useRoles()
    const {data: projects, isLoading: isProjectsLoading, isError: isProjectsError} = useProjects()

    const createUserMutation = useCreateUser()
    const updateUserMutation = useUpdateUser()
    const deleteUserMutation = useDeleteUser()
    const addProjectMemberMutation = useAddProjectMember()
    const removeProjectMemberMutation = useRemoveProjectMember()
    const approveRequestMutation = useApproveProjectAccessRequest()
    const rejectRequestMutation = useRejectProjectAccessRequest()

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<IUser | null>(null)
    const [createForm] = Form.useForm<CreateUserFormValues>()
    const [updateForm] = Form.useForm<UpdateUserFormValues>()

    const isAdmin = me?.role?.slug === "admin"
    const isTeamlead = me?.role?.slug === "teamlead"
    const isUser = me?.role?.slug === "user"
    const canReviewRequests = isAdmin || isTeamlead

    const {
        data: projectAccessRequests,
        isLoading: isProjectAccessRequestsLoading,
        isError: isProjectAccessRequestsError,
    } = useProjectAccessRequestInbox(canReviewRequests)

    const { data: regRequests, isLoading: isRegLoading } = useRegistrationRequests(canReviewRequests)
    const approveRegMutation = useApproveRegistration()
    const rejectRegMutation = useRejectRegistration()

    const roleOptions = useMemo(() => {
        return (roles ?? []).map(role => ({
            value: role.id,
            label: `${role.name} (${role.slug})`,
        }))
    }, [roles])

    const roleById = useMemo(() => new Map((roles ?? []).map(role => [role.id, role])), [roles])

    const manageableProjects = useMemo(() => {
        if (isAdmin) {
            return projects ?? []
        }

        if (isTeamlead) {
            return (projects ?? []).filter(project => project.owner?.id === me?.id)
        }

        return []
    }, [isAdmin, isTeamlead, me?.id, projects])

    const projectOptions = useMemo(() => {
        return manageableProjects.map(project => ({
            value: project.id,
            label: project.name,
        }))
    }, [manageableProjects])

    const userProjectIdsByUserId = useMemo(() => {
        const map = new Map<number, number[]>()

        for (const project of manageableProjects) {
            for (const member of project.members ?? []) {
                const existing = map.get(member.user.id) ?? []
                map.set(member.user.id, [...existing, project.id])
            }
        }

        return map
    }, [manageableProjects])

    if (isMeLoading || isUsersLoading || isRolesLoading || isProjectsLoading) {
        return <Spin/>
    }

    if (!me) {
        return <Alert type="error" title="Не удалось определить текущего пользователя"/>
    }

    if (!isAdmin && !isTeamlead && !isUser) {
        return <Alert type="warning" title="Раздел недоступен для текущей роли"/>
    }

    if (isUsersError || isRolesError || isProjectsError || !users || !roles || !projects) {
        return <Alert type="error" title="Не удалось загрузить пользователей, роли или проекты"/>
    }

    const openCreateModal = () => {
        if (!isAdmin) {
            return
        }

        createForm.resetFields()
        createForm.setFieldsValue({
            canCreateProjects: false,
            roleId: roles[0]?.id,
        })
        setIsCreateModalOpen(true)
    }

    const openEditModal = (user: IUser) => {
        setEditingUser(user)
        updateForm.setFieldsValue({
            roleId: user.role.id,
            canCreateProjects: Boolean(user.canCreatePlans),
            projectIds: userProjectIdsByUserId.get(user.id) ?? [],
        })
    }

    const handleCreateUser = (values: CreateUserFormValues) => {
        if (!isAdmin) {
            return
        }

        const role = roleById.get(values.roleId)
        if (!role) {
            message.error("Не удалось определить выбранную роль")
            return
        }

        createUserMutation.mutate({
            email: values.email.trim(),
            username: values.username.trim(),
            password: values.password,
            role: role.slug,
            canCreatePlans: values.canCreateProjects,
        }, {
            onSuccess: () => {
                message.success("Пользователь создан")
                setIsCreateModalOpen(false)
                createForm.resetFields()
            },
            onError: () => {
                message.error("Не удалось создать пользователя")
            },
        })
    }

    const handleUpdateUser = (values: UpdateUserFormValues) => {
        if (!editingUser) {
            return
        }

        const currentProjectIds = userProjectIdsByUserId.get(editingUser.id) ?? []
        const nextProjectIds = values.projectIds ?? []

        const projectIdsToAdd = nextProjectIds.filter(projectId => !currentProjectIds.includes(projectId))
        const projectIdsToRemove = currentProjectIds.filter(projectId => !nextProjectIds.includes(projectId))

        const syncProjectMembership = async () => {
            await Promise.all([
                ...projectIdsToAdd.map(projectId =>
                    addProjectMemberMutation.mutateAsync({
                        projectId,
                        userId: editingUser.id,
                    })
                ),
                ...projectIdsToRemove.map(projectId =>
                    removeProjectMemberMutation.mutateAsync({
                        projectId,
                        userId: editingUser.id,
                    })
                ),
            ])
        }

        if (!isAdmin) {
            syncProjectMembership()
                .then(() => {
                    message.success("Доступ к проектам обновлен")
                    setEditingUser(null)
                    updateForm.resetFields()
                })
                .catch(() => {
                    message.error("Не удалось обновить доступ к проектам")
                })
            return
        }

        updateUserMutation.mutate({
            id: editingUser.id,
            request: {
                roleId: values.roleId ?? editingUser.role.id,
                canCreatePlans: values.canCreateProjects,
            },
        }, {
            onSuccess: async () => {
                try {
                    await syncProjectMembership()
                    message.success("Пользователь обновлен")
                    setEditingUser(null)
                    updateForm.resetFields()
                } catch {
                    message.error("Не удалось обновить доступ к проектам")
                }
            },
            onError: () => {
                message.error("Не удалось обновить пользователя")
            },
        })
    }

    const handleDeleteUser = (user: IUser) => {
        deleteUserMutation.mutate(user.id, {
            onSuccess: () => {
                message.success("Пользователь удален")
            },
            onError: () => {
                message.error("Не удалось удалить пользователя")
            },
        })
    }

    const canDeleteUser = (user: IUser) => {
        if (!isAdmin) {
            return false
        }

        if (me.id === user.id) {
            return false
        }

        return user.role?.slug !== "admin"
    }

    const handleApproveRequest = (request: IProjectAccessRequest) => {
        approveRequestMutation.mutate({id: request.id}, {
            onSuccess: () => {
                message.success("Заявка одобрена")
            },
            onError: () => {
                message.error("Не удалось одобрить заявку")
            },
        })
    }

    const handleRejectRequest = (request: IProjectAccessRequest) => {
        rejectRequestMutation.mutate({id: request.id}, {
            onSuccess: () => {
                message.success("Заявка отклонена")
            },
            onError: () => {
                message.error("Не удалось отклонить заявку")
            },
        })
    }

    const columns: ColumnsType<IUser> = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 90,
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            width: 250,
        },
        {
            title: "Имя",
            dataIndex: "username",
            key: "username",
        },
        {
            title: "Роль",
            key: "role",
            render: (_, user) => <Tag>{user.role.name} ({user.role.slug})</Tag>,
            width: 200,
        },
        {
            title: "Права",
            key: "canCreatePlans",
            render: (_, user) => user.canCreatePlans ? <Tag color="success">Создание проектов: да</Tag> : <Tag>Создание проектов: нет</Tag>,
            width: 220,
        },
        {
            title: "Проекты",
            key: "projects",
            width: 280,
            render: (_, user) => {
                const projectIds = userProjectIdsByUserId.get(user.id) ?? []
                if (!projectIds.length) {
                    return <Tag>Нет доступа</Tag>
                }

                return (
                    <Space size={4} wrap>
                        {projectIds.map(projectId => {
                            const project = manageableProjects.find(item => item.id === projectId)
                            if (!project) {
                                return null
                            }

                            return <Tag key={projectId}>{project.name}</Tag>
                        })}
                    </Space>
                )
            },
        },
        {
            title: "Создан",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 190,
            render: (value: string) => new Date(value).toLocaleString("ru-RU"),
        },
    ]

    if (!isUser) {
        columns.push({
            title: "Действия",
            key: "actions",
            width: isAdmin ? 260 : 150,
            render: (_, user) => (
                <Space>
                    <Button onClick={() => openEditModal(user)}>
                        Редактировать
                    </Button>
                    {isAdmin && (
                        <Popconfirm
                            title="Удалить пользователя?"
                            description={
                                canDeleteUser(user)
                                    ? "Действие нельзя отменить"
                                    : "Нельзя удалить себя или пользователя с ролью admin"
                            }
                            okText="Удалить"
                            cancelText="Отмена"
                            disabled={!canDeleteUser(user)}
                            onConfirm={() => handleDeleteUser(user)}
                        >
                            <Button danger loading={deleteUserMutation.isPending} disabled={!canDeleteUser(user)}>
                                Удалить
                            </Button>
                        </Popconfirm>
                    )}
                </Space>
            ),
        })
    }

    const requestColumns: ColumnsType<IProjectAccessRequest> = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 90,
        },
        {
            title: "Проект",
            key: "project",
            render: (_, request) => `${request.projectName} (#${request.projectId})`,
        },
        {
            title: "Кто просит",
            key: "requester",
            render: (_, request) => {
                const requester = request.requester
                return requester.username
                    ? `${requester.username} (${requester.email})`
                    : requester.email
            },
            width: 280,
        },
        {
            title: "Комментарий",
            dataIndex: "comment",
            key: "comment",
            render: (value?: string) => value || "-",
            width: 260,
        },
        {
            title: "Создана",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 190,
            render: (value: string) => new Date(value).toLocaleString("ru-RU"),
        },
        {
            title: "Действия",
            key: "actions",
            width: 230,
            render: (_, request) => (
                <Space>
                    <Button
                        type="primary"
                        loading={approveRequestMutation.isPending}
                        onClick={() => handleApproveRequest(request)}
                    >
                        Одобрить
                    </Button>
                    <Button
                        danger
                        loading={rejectRequestMutation.isPending}
                        onClick={() => handleRejectRequest(request)}
                    >
                        Отклонить
                    </Button>
                </Space>
            ),
        },
    ]

    const regColumns: ColumnsType<IRegistrationRequest> = [
        { title: "ID", dataIndex: "id", key: "id", width: 90 },
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "Имя", dataIndex: "username", key: "username" },
        {
            title: "Действия",
            key: "actions",
            width: 230,
            render: (_, rec) => (
                <Space>
                    <Button
                        type="primary"
                        onClick={() => approveRegMutation.mutate(rec.id)}
                        loading={approveRegMutation.isPending}
                    >Одобрить</Button>
                    <Button
                        danger
                        onClick={() => rejectRegMutation.mutate(rec.id)}
                        loading={rejectRegMutation.isPending}
                    >Отклонить</Button>
                </Space>
            )
        }
    ]

    return (
        <>
            <Card>
                <Space style={{width: "100%", justifyContent: "space-between", marginBottom: 16}}>
                    <Title level={2} style={{margin: 0}}>Пользователи</Title>
                    {isAdmin && (
                        <Button type="primary" onClick={openCreateModal}>Создать пользователя</Button>
                    )}
                </Space>

                <Table<IUser>
                    rowKey="id"
                    columns={columns}
                    dataSource={users}
                    pagination={{pageSize: 10}}
                />
            </Card>

            {isAdmin && (
                <Modal
                    title="Создать пользователя"
                    open={isCreateModalOpen}
                    onCancel={() => setIsCreateModalOpen(false)}
                    onOk={() => createForm.submit()}
                    okText="Создать"
                    confirmLoading={createUserMutation.isPending}
                    destroyOnClose
                >
                    <Form form={createForm} layout="vertical" onFinish={handleCreateUser}>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                {required: true, message: "Введите email"},
                                {type: "email", message: "Некорректный email"},
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="Имя пользователя"
                            name="username"
                            rules={[{required: true, message: "Введите имя пользователя"}]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="Пароль"
                            name="password"
                            rules={[
                                {required: true, message: "Введите пароль"},
                                {min: 6, message: "Минимум 6 символов"},
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>

                        <Form.Item
                            label="Роль"
                            name="roleId"
                            rules={[{required: true, message: "Выберите роль"}]}
                        >
                            <Select options={roleOptions} />
                        </Form.Item>

                        <Form.Item label="Может создавать проекты" name="canCreateProjects" valuePropName="checked">
                            <Switch />
                        </Form.Item>
                    </Form>
                </Modal>
            )}

            <Modal
                title={editingUser ? `Редактировать ${editingUser.email}` : "Редактировать пользователя"}
                open={Boolean(editingUser)}
                onCancel={() => setEditingUser(null)}
                onOk={() => updateForm.submit()}
                okText="Сохранить"
                confirmLoading={
                    updateUserMutation.isPending ||
                    addProjectMemberMutation.isPending ||
                    removeProjectMemberMutation.isPending
                }
                destroyOnClose
            >
                {editingUser ? (
                    <Form form={updateForm} layout="vertical" onFinish={handleUpdateUser}>
                        <Form.Item label="Email">
                            <Text>{editingUser.email}</Text>
                        </Form.Item>

                        {isAdmin && (
                            <Form.Item
                                label="Роль"
                                name="roleId"
                                rules={[{required: true, message: "Выберите роль"}]}
                            >
                                <Select options={roleOptions} />
                            </Form.Item>
                        )}

                        {isAdmin && (
                            <Form.Item label="Может создавать проекты" name="canCreateProjects" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                        )}

                        <Form.Item label="Доступ к проектам" name="projectIds">
                            <Select
                                mode="multiple"
                                placeholder="Выберите проекты"
                                options={projectOptions}
                                showSearch
                                optionFilterProp="label"
                            />
                        </Form.Item>
                    </Form>
                ) : null}
            </Modal>

            {canReviewRequests && (
                <Card title="Заявки в проект" style={{marginTop: 16}}>
                    {isProjectAccessRequestsLoading && <Spin />}

                    {!isProjectAccessRequestsLoading && isProjectAccessRequestsError && (
                        <Alert type="error" title="Не удалось загрузить заявки в проект" />
                    )}

                    {!isProjectAccessRequestsLoading && !isProjectAccessRequestsError && (
                        <Table<IProjectAccessRequest>
                            rowKey="id"
                            columns={requestColumns}
                            dataSource={projectAccessRequests ?? []}
                            locale={{emptyText: "Нет заявок"}}
                            pagination={{pageSize: 8}}
                        />
                    )}
                </Card>
            )}

            {canReviewRequests && (
                <Card title="Заявки на регистрацию" style={{marginTop: 16}}>
                    <Table<IRegistrationRequest>
                        rowKey="id"
                        columns={regColumns}
                        dataSource={Array.isArray(regRequests) ? regRequests : []}
                        loading={isRegLoading}
                        locale={{emptyText: "Нет новых заявок"}}
                        pagination={{pageSize: 8}}
                    />
                </Card>
            )}
        </>
    )
}