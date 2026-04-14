import {ArrowLeftOutlined, PlusOutlined} from "@ant-design/icons";
import {
    Alert,
    App,
    Breadcrumb,
    Button,
    Card,
    DatePicker,
    Descriptions,
    Form,
    Modal,
    Popconfirm,
    Select,
    Space,
    Spin,
    Table,
    Tag,
    Typography
} from "antd";
import type {ColumnsType} from "antd/es/table";
import type {Dayjs} from "dayjs";
import {useMemo, useState} from "react";
import {Link, useNavigate, useParams} from "react-router";
import {useCase, useDeleteCase} from "../../hooks/case/caseHooks.ts";
import {usePlans} from "../../hooks/plan/planHooks.ts";
import {useCreateRun, useRuns, useRunStatuses} from "../../hooks/run/runHooks.ts";
import type {IRun} from "../../models/run/run.ts";
import {getRunExecutorLabel, getRunStatusColor} from "../../utils/runPresentation.ts";

const {Title, Paragraph, Text} = Typography

interface CreateRunFormValues {
    planId: number
    statusId: number
    executedAt: Dayjs
}

export const OneCasePage = () => {
    const navigate = useNavigate()
    const {id} = useParams()
    const caseId = Number(id)
    const {message} = App.useApp()

    const [isCreateRunModalOpen, setIsCreateRunModalOpen] = useState(false)
    const [createRunForm] = Form.useForm<CreateRunFormValues>()

    const {data: testCase, isLoading, isError} = useCase(caseId)
    const {data: plans} = usePlans()
    const {data: runs} = useRuns({caseId})
    const {data: runStatuses} = useRunStatuses()
    const deleteCaseMutation = useDeleteCase()
    const createRunMutation = useCreateRun()

    const availablePlans = useMemo(() => {
        return (plans ?? []).filter(plan => (plan.cases ?? []).some(testPlanCase => testPlanCase.id === caseId))
    }, [plans, caseId])

    if (isLoading) {
        return <Spin/>
    }

    if (isError || testCase === undefined) {
        return <Alert type="error" title="Не удалось загрузить тест-кейс"/>
    }

    const handleDelete = () => {
        navigate("/cases", {replace: true})
        deleteCaseMutation.mutate(caseId, {
            onSuccess: () => {
                void message.success("Тест-кейс удален")
            },
        })
    }

    const runsColumns: ColumnsType<IRun> = [
        {
            title: "Дата",
            dataIndex: "executedAt",
            key: "executedAt",
            width: 220,
            render: (value: string) => new Date(value).toLocaleString("ru-RU"),
        },
        {
            title: "План",
            key: "plan",
            render: (_, run) => <Link to={`/plans/${run.planId}`}>{run.planName || `Plan #${run.planId}`}</Link>,
        },
        {
            title: "Статус",
            key: "status",
            width: 140,
            render: (_, run) => <Tag color={getRunStatusColor(run.statusSlug)}>{run.statusName}</Tag>,
        },
        {
            title: "Исполнитель",
            key: "executedBy",
            render: (_, run) => getRunExecutorLabel(run),
        },
    ]

    const handleCreateRun = (values: CreateRunFormValues) => {
        createRunMutation.mutate(
            {
                caseId,
                planId: values.planId,
                statusId: values.statusId,
                executedAt: values.executedAt.toISOString(),
            },
            {
                onSuccess: () => {
                    setIsCreateRunModalOpen(false)
                    createRunForm.resetFields()
                    void message.success("Прогон добавлен")
                },
            }
        )
    }

    return (
        <Space direction="vertical" size="large" style={{width: "100%"}}>
            <Space direction="vertical" size="middle" style={{width: "100%"}}>
                <Breadcrumb
                    items={[
                        {
                            title: <Link to="/cases">Тест-кейсы и группы</Link>,
                        },
                        {
                            title: testCase.title,
                        },
                    ]}
                />

                <Space>
                    <Button icon={<ArrowLeftOutlined/>} onClick={() => navigate(-1)}>
                        Назад
                    </Button>

                    <Button onClick={() => navigate(`/cases/${caseId}/edit`)}>
                        Редактировать
                    </Button>

                    <Popconfirm
                        title="Удалить тест-кейс?"
                        description="Это действие нельзя отменить"
                        onConfirm={handleDelete}
                        okText="Удалить"
                        cancelText="Отмена"
                    >
                        <Button danger loading={deleteCaseMutation.isPending}>
                            Удалить
                        </Button>
                    </Popconfirm>
                </Space>
            </Space>

            <Card>
                <Title level={2} style={{marginTop: 0}}>
                    {testCase.title}
                </Title>

                <Descriptions bordered column={1}>
                    <Descriptions.Item label="ID">{testCase.id}</Descriptions.Item>
                    <Descriptions.Item label="Название">{testCase.title}</Descriptions.Item>
                    <Descriptions.Item label="Группа">
                        {testCase.group?.name ?? testCase.group?.id ?? "Не указана"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Теги">
                        {testCase.tags?.length
                            ? testCase.tags.map(tag => <Tag key={tag}>{tag}</Tag>)
                            : "Нет тегов"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Создан">
                        {new Date(testCase.createdAt).toLocaleString("ru-RU")}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Card title="Описание">
                <Paragraph style={{marginBottom: 0}}>
                    {testCase.description || "Нет описания"}
                </Paragraph>
            </Card>

            <Card title="Предусловия">
                <Paragraph style={{marginBottom: 0}}>
                    {testCase.preconditions || "Нет предусловий"}
                </Paragraph>
            </Card>

            <Card title="Постусловия">
                <Paragraph style={{marginBottom: 0}}>
                    {testCase.postconditions || "Нет постусловий"}
                </Paragraph>
            </Card>

            <Card title="Шаги">
                {testCase.steps?.length ? (
                    <Table
                        dataSource={testCase.steps}
                        rowKey={step => step.id}
                        pagination={false}
                        columns={[
                            {
                                title: "№",
                                render: (_, __, index) => index + 1,
                                width: 60,
                            },
                            {
                                title: "Действие",
                                dataIndex: "action",
                                key: "action",
                                render: (text: string) => text || "-",
                            },
                            {
                                title: "Ожидаемый результат",
                                dataIndex: "expectedResult",
                                key: "expectedResult",
                                render: (text: string) => text || "-",
                            },
                        ]}
                    />
                ) : (
                    <Text type="secondary">Шагов нет</Text>
                )}
            </Card>

            <Card
                title="Последние прогоны"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined/>}
                        onClick={() => setIsCreateRunModalOpen(true)}
                    >
                        Добавить прогон
                    </Button>
                }
            >
                {runs?.length ? (
                    <Table<IRun>
                        rowKey="id"
                        columns={runsColumns}
                        dataSource={runs.slice(0, 10)}
                        pagination={false}
                    />
                ) : (
                    <Text type="secondary">Прогонов пока нет</Text>
                )}
            </Card>

            <Modal
                title="Добавить прогон"
                open={isCreateRunModalOpen}
                onCancel={() => setIsCreateRunModalOpen(false)}
                footer={null}
                destroyOnClose
            >
                {!availablePlans.length ? (
                    <Alert
                        type="warning"
                        showIcon
                        message="Для этого тест-кейса нет тест-планов"
                        description="Сначала добавьте тест-кейс в нужный тест-план, затем можно будет внести прогон."
                    />
                ) : (
                    <Form<CreateRunFormValues>
                        form={createRunForm}
                        layout="vertical"
                        onFinish={handleCreateRun}
                        initialValues={{
                            planId: availablePlans[0].id,
                        }}
                    >
                        <Form.Item
                            name="planId"
                            label="Тест-план"
                            rules={[{required: true, message: "Выберите тест-план"}]}
                        >
                            <Select
                                options={availablePlans.map(plan => ({
                                    value: plan.id,
                                    label: plan.name,
                                }))}
                            />
                        </Form.Item>

                        <Form.Item
                            name="statusId"
                            label="Статус"
                            rules={[{required: true, message: "Выберите статус"}]}
                        >
                            <Select
                                options={(runStatuses ?? []).map(status => ({
                                    value: status.id,
                                    label: status.name,
                                }))}
                            />
                        </Form.Item>

                        <Form.Item
                            name="executedAt"
                            label="Дата запуска"
                            rules={[{required: true, message: "Укажите дату запуска"}]}
                        >
                            <DatePicker showTime={{format: "HH:mm"}} format="DD.MM.YYYY HH:mm" style={{width: "100%"}}/>
                        </Form.Item>

                        <Space>
                            <Button type="primary" htmlType="submit" loading={createRunMutation.isPending}>
                                Сохранить
                            </Button>
                            <Button onClick={() => setIsCreateRunModalOpen(false)}>
                                Отмена
                            </Button>
                        </Space>
                    </Form>
                )}
            </Modal>
        </Space>
    )
}
