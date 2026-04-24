import {Alert, App, Button, Card, Form, Input, InputNumber, Modal, Space, Spin, Table, Tag, Typography} from "antd";
import type {ColumnsType} from "antd/es/table";
import {useMemo, useState} from "react";
import {useCreateProject, useCreateProjectAccessRequest, useProjects} from "../../hooks/project/projectHooks.ts";
import {useMe} from "../../hooks/user/userHooks.ts";
import type {IProject} from "../../models/project/project.ts";

const {Title, Paragraph} = Typography

interface CreateProjectFormValues {
    name: string
    description?: string
}

interface CreateAccessRequestFormValues {
    projectId: number
    comment?: string
}

export const ProjectsListPage = () => {
    const {message} = App.useApp()
    const {data: projects, isLoading, isError} = useProjects()
    const {data: me} = useMe()
    const createProjectMutation = useCreateProject()
    const createAccessRequestMutation = useCreateProjectAccessRequest()

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isAccessRequestModalOpen, setIsAccessRequestModalOpen] = useState(false)
    const [createForm] = Form.useForm<CreateProjectFormValues>()
    const [accessRequestForm] = Form.useForm<CreateAccessRequestFormValues>()

    const canCreateProjects = useMemo(() => {
        if (!me?.role) {
            return false
        }

        if (me.role.slug === "admin") {
            return true
        }

        if (me.role.slug === "teamlead") {
            return Boolean(me.canCreatePlans)
        }

        return false
    }, [me])

    const canRequestProjectAccess = useMemo(() => {
        const slug = me?.role?.slug
        return slug === "teamlead" || slug === "user"
    }, [me])

    if (isLoading) {
        return <Spin />
    }

    if (isError || !projects) {
        return <Alert type="error" title="Не удалось загрузить проекты" />
    }

    const columns: ColumnsType<IProject> = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 90,
        },
        {
            title: "Название",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Владелец",
            key: "owner",
            render: (_, project) => {
                const owner = project.owner
                if (!owner) {
                    return "Не указан"
                }
                return owner.username ? `${owner.username} (${owner.email})` : owner.email
            },
            width: 280,
        },
        {
            title: "Участников",
            key: "members",
            render: (_, project) => project.members?.length ?? 0,
            width: 130,
        },
        {
            title: "Создан",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 190,
            render: (value: string) => new Date(value).toLocaleString("ru-RU"),
        },
    ]

    const handleCreateProject = (values: CreateProjectFormValues) => {
        createProjectMutation.mutate({
            name: values.name.trim(),
            description: values.description?.trim() || undefined,
        }, {
            onSuccess: () => {
                message.success("Проект создан")
                setIsCreateModalOpen(false)
                createForm.resetFields()
            },
            onError: () => {
                message.error("Не удалось создать проект")
            },
        })
    }

    const handleCreateAccessRequest = (values: CreateAccessRequestFormValues) => {
        createAccessRequestMutation.mutate({
            projectId: values.projectId,
            comment: values.comment?.trim() || undefined,
        }, {
            onSuccess: () => {
                message.success("Заявка на доступ отправлена")
                setIsAccessRequestModalOpen(false)
                accessRequestForm.resetFields()
            },
            onError: () => {
                message.error("Не удалось отправить заявку")
            },
        })
    }

    return (
        <>
            <Card>
                <Space style={{width: "100%", justifyContent: "space-between", marginBottom: 16}}>
                    <Title level={2} style={{margin: 0}}>Проекты</Title>
                    <Space>
                        {canRequestProjectAccess && (
                            <Button onClick={() => setIsAccessRequestModalOpen(true)}>
                                Запросить доступ
                            </Button>
                        )}
                        <Button
                            type="primary"
                            disabled={!canCreateProjects}
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            Создать проект
                        </Button>
                    </Space>
                </Space>

                {!canCreateProjects && (
                    <Alert
                        type="info"
                        showIcon
                        style={{marginBottom: 16}}
                        message="Создание проектов доступно администраторам и тимлидам с разрешением"
                    />
                )}

                <Table<IProject>
                    rowKey="id"
                    columns={columns}
                    dataSource={projects}
                    pagination={{pageSize: 10}}
                    expandable={{
                        expandedRowRender: project => (
                            <Space direction="vertical" size="small" style={{width: "100%"}}>
                                <Paragraph style={{marginBottom: 8}}>
                                    {project.description || "Описание отсутствует"}
                                </Paragraph>
                                <Space wrap>
                                    {(project.members ?? []).map(member => (
                                        <Tag key={member.id}>
                                            {member.user.username
                                                ? `${member.user.username} (${member.user.email})`
                                                : member.user.email}
                                        </Tag>
                                    ))}
                                    {(project.members ?? []).length === 0 && (
                                        <Tag>Участников нет</Tag>
                                    )}
                                </Space>
                            </Space>
                        ),
                    }}
                />
            </Card>

            <Modal
                title="Создать проект"
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
                onOk={() => createForm.submit()}
                okText="Создать"
                confirmLoading={createProjectMutation.isPending}
                destroyOnClose
            >
                <Form<CreateProjectFormValues>
                    form={createForm}
                    layout="vertical"
                    onFinish={handleCreateProject}
                >
                    <Form.Item
                        label="Название"
                        name="name"
                        rules={[
                            {required: true, message: "Введите название"},
                            {max: 255, message: "Максимум 255 символов"},
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Описание"
                        name="description"
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Заявка на доступ к проекту"
                open={isAccessRequestModalOpen}
                onCancel={() => setIsAccessRequestModalOpen(false)}
                onOk={() => accessRequestForm.submit()}
                okText="Отправить"
                confirmLoading={createAccessRequestMutation.isPending}
                destroyOnClose
            >
                <Form<CreateAccessRequestFormValues>
                    form={accessRequestForm}
                    layout="vertical"
                    onFinish={handleCreateAccessRequest}
                >
                    <Form.Item
                        label="ID проекта"
                        name="projectId"
                        rules={[{required: true, message: "Укажите ID проекта"}]}
                    >
                        <InputNumber style={{width: "100%"}} min={1} />
                    </Form.Item>

                    <Form.Item
                        label="Комментарий"
                        name="comment"
                    >
                        <Input.TextArea rows={4} placeholder="Необязательно" />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}
