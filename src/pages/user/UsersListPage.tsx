import {Alert, App, Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Spin, Switch, Table, Tag, Typography} from "antd";
import type {ColumnsType} from "antd/es/table";
import {useMemo, useState} from "react";
import {useDeleteUser, useMe, useUsers, useCreateUser, useUpdateUser} from "../../hooks/user/userHooks.ts";
import {useRoles} from "../../hooks/user/roleHooks.ts";
import type {IUser} from "../../models/user/user.ts";

const {Title, Text} = Typography

interface CreateUserFormValues {
    email: string
    username: string
    password: string
    roleId: number
    canCreatePlans: boolean
}

interface UpdateUserFormValues {
    roleId: number
    canCreatePlans: boolean
}

export const UsersListPage = () => {
    const {message} = App.useApp()
    const {data: me, isLoading: isMeLoading} = useMe()
    const {data: users, isLoading: isUsersLoading, isError: isUsersError} = useUsers()
    const {data: roles, isLoading: isRolesLoading, isError: isRolesError} = useRoles()

    const createUserMutation = useCreateUser()
    const updateUserMutation = useUpdateUser()
    const deleteUserMutation = useDeleteUser()

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<IUser | null>(null)
    const [createForm] = Form.useForm<CreateUserFormValues>()
    const [updateForm] = Form.useForm<UpdateUserFormValues>()

    const roleOptions = useMemo(() => {
        return (roles ?? []).map(role => ({
            value: role.id,
            label: `${role.name} (${role.slug})`,
        }))
    }, [roles])

    const roleById = useMemo(() => new Map((roles ?? []).map(role => [role.id, role])), [roles])

    if (isMeLoading || isUsersLoading || isRolesLoading) {
        return <Spin/>
    }

    if (!me) {
        return <Alert type="error" title="Не удалось определить текущего пользователя"/>
    }

    if (me.role?.slug !== "admin") {
        return <Alert type="warning" title="Раздел доступен только администраторам"/>
    }

    if (isUsersError || isRolesError || !users || !roles) {
        return <Alert type="error" title="Не удалось загрузить пользователей или роли"/>
    }

    const openCreateModal = () => {
        createForm.resetFields()
        createForm.setFieldsValue({
            canCreatePlans: false,
            roleId: roles[0]?.id,
        })
        setIsCreateModalOpen(true)
    }

    const openEditModal = (user: IUser) => {
        setEditingUser(user)
        updateForm.setFieldsValue({
            roleId: user.role.id,
            canCreatePlans: Boolean(user.canCreatePlans),
        })
    }

    const handleCreateUser = (values: CreateUserFormValues) => {
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
            canCreatePlans: values.canCreatePlans,
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

        updateUserMutation.mutate({
            id: editingUser.id,
            request: {
                roleId: values.roleId,
                canCreatePlans: values.canCreatePlans,
            },
        }, {
            onSuccess: () => {
                message.success("Пользователь обновлен")
                setEditingUser(null)
                updateForm.resetFields()
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
            render: (_, user) => user.canCreatePlans ? <Tag color="success">Создание планов: да</Tag> : <Tag>Создание планов: нет</Tag>,
            width: 220,
        },
        {
            title: "Создан",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 190,
            render: (value: string) => new Date(value).toLocaleString("ru-RU"),
        },
        {
            title: "Действия",
            key: "actions",
            width: 220,
            render: (_, user) => (
                <Space>
                    <Button onClick={() => openEditModal(user)}>
                        Редактировать
                    </Button>
                    <Popconfirm
                        title="Удалить пользователя?"
                        description="Действие нельзя отменить"
                        okText="Удалить"
                        cancelText="Отмена"
                        onConfirm={() => handleDeleteUser(user)}
                    >
                        <Button danger loading={deleteUserMutation.isPending}>
                            Удалить
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ]

    return (
        <>
            <Card>
                <Space style={{width: "100%", justifyContent: "space-between", marginBottom: 16}}>
                    <Title level={2} style={{margin: 0}}>Пользователи</Title>
                    <Button type="primary" onClick={openCreateModal}>Создать пользователя</Button>
                </Space>

                <Table<IUser>
                    rowKey="id"
                    columns={columns}
                    dataSource={users}
                    pagination={{pageSize: 10}}
                />
            </Card>

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

                    <Form.Item label="Может создавать планы" name="canCreatePlans" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={editingUser ? `Редактировать ${editingUser.email}` : "Редактировать пользователя"}
                open={Boolean(editingUser)}
                onCancel={() => setEditingUser(null)}
                onOk={() => updateForm.submit()}
                okText="Сохранить"
                confirmLoading={updateUserMutation.isPending}
                destroyOnClose
            >
                {editingUser ? (
                    <Form form={updateForm} layout="vertical" onFinish={handleUpdateUser}>
                        <Form.Item label="Email">
                            <Text>{editingUser.email}</Text>
                        </Form.Item>

                        <Form.Item
                            label="Роль"
                            name="roleId"
                            rules={[{required: true, message: "Выберите роль"}]}
                        >
                            <Select options={roleOptions} />
                        </Form.Item>

                        <Form.Item label="Может создавать планы" name="canCreatePlans" valuePropName="checked">
                            <Switch />
                        </Form.Item>
                    </Form>
                ) : null}
            </Modal>
        </>
    )
}