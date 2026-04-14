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
    Progress,
    Select,
    Space,
    Spin,
    Statistic,
    Table,
    Tag,
    Typography
} from "antd";
import type {ColumnsType} from "antd/es/table";
import type {Dayjs} from "dayjs";
import {Link, useNavigate, useParams} from "react-router";
import {useDeletePlan, usePlan} from "../../hooks/plan/planHooks.ts";
import type {ICaseCompact} from "../../models/case/case.ts";
import {useCreateRun, useRuns, useRunStatuses} from "../../hooks/run/runHooks.ts";
import type {IRun} from "../../models/run/run.ts";
import {getRunExecutorLabel, getRunStatusColor} from "../../utils/runPresentation.ts";
import {useState} from "react";

const {Title, Paragraph, Text} = Typography

interface CreateRunFormValues {
    caseId: number
    statusId: number
    executedAt: Dayjs
}

export const OnePlanPage = () => {
    const navigate = useNavigate()
    const {id} = useParams()
    const planId = Number(id)
    const {message} = App.useApp()

    const [isCreateRunModalOpen, setIsCreateRunModalOpen] = useState(false)
    const [createRunForm] = Form.useForm<CreateRunFormValues>()

    const {data: testPlan, isLoading, isError} = usePlan(planId)
    const {data: runs} = useRuns({planId})
    const {data: runStatuses} = useRunStatuses()
    const createRunMutation = useCreateRun()
    const deletePlanMutation = useDeletePlan()

    if (isLoading) {
        return <Spin/>
    }

    if (isError || testPlan === undefined) {
        return <Alert type="error" title="Не удалось загрузить тест-план"/>
    }

    const responsibleUserText = (() => {
        const user = testPlan.responsibleUser
        if (!user) {
            return "Не указан"
        }
        if (!user.username) {
            return user.email
        }
        return `${user.username} (${user.email})`
    })()

    const caseColumns: ColumnsType<ICaseCompact> = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 100,
        },
        {
            title: "Название",
            dataIndex: "title",
            key: "title",
        },
    ]

    const runColumns: ColumnsType<IRun> = [
        {
            title: "Дата",
            dataIndex: "executedAt",
            key: "executedAt",
            width: 220,
            render: (value: string) => new Date(value).toLocaleString("ru-RU"),
        },
        {
            title: "Тест-кейс",
            key: "case",
            render: (_, run) => <Link to={`/cases/${run.caseId}`}>{run.caseTitle || `Case #${run.caseId}`}</Link>,
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

    const handleDelete = () => {
        navigate("/plans", {replace: true})
        deletePlanMutation.mutate(planId, {
            onSuccess: () => {
                void message.success("Тест-план удален")
            },
        })
    }

    const handleCreateRun = (values: CreateRunFormValues) => {
        createRunMutation.mutate(
            {
                planId,
                caseId: values.caseId,
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

    const totalRuns = runs?.length ?? 0
    const passedRuns = (runs ?? []).filter(run => run.statusSlug === "passed").length
    const failedRuns = (runs ?? []).filter(run => run.statusSlug === "failed").length
    const brokenRuns = (runs ?? []).filter(run => run.statusSlug === "broken").length
    const skippedRuns = (runs ?? []).filter(run => run.statusSlug === "skipped").length
    const successRate = totalRuns > 0 ? Math.round((passedRuns / totalRuns) * 100) : 0

    return (
        <Space direction="vertical" size="large" style={{width: "100%"}}>
            <Space direction="vertical" size="middle" style={{width: "100%"}}>
                <Breadcrumb
                    items={[
                        {
                            title: <Link to="/plans">Тест-планы</Link>,
                        },
                        {
                            title: testPlan.name,
                        },
                    ]}
                />

                <Space>
                    <Button icon={<ArrowLeftOutlined/>} onClick={() => navigate(-1)}>
                        Назад
                    </Button>

                    <Button onClick={() => navigate(`/plans/${planId}/edit`)}>
                        Редактировать
                    </Button>

                    <Popconfirm
                        title="Удалить тест-план?"
                        description="Это действие нельзя отменить"
                        onConfirm={handleDelete}
                        okText="Удалить"
                        cancelText="Отмена"
                    >
                        <Button danger loading={deletePlanMutation.isPending}>
                            Удалить
                        </Button>
                    </Popconfirm>
                </Space>
            </Space>

            <Card>
                <Title level={2} style={{marginTop: 0}}>
                    {testPlan.name}
                </Title>

                <Descriptions bordered column={1}>
                    <Descriptions.Item label="ID">{testPlan.id}</Descriptions.Item>
                    <Descriptions.Item label="Название">{testPlan.name}</Descriptions.Item>
                    <Descriptions.Item label="Начало">
                        {new Date(testPlan.startDate).toLocaleString("ru-RU")}
                    </Descriptions.Item>
                    <Descriptions.Item label="Конец">
                        {new Date(testPlan.endDate).toLocaleString("ru-RU")}
                    </Descriptions.Item>
                    <Descriptions.Item label="Создан">
                        {new Date(testPlan.createdAt).toLocaleString("ru-RU")}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ответственный">{responsibleUserText}</Descriptions.Item>
                </Descriptions>
            </Card>

            <Card title="Введение">
                <Paragraph style={{marginBottom: 0}}>
                    {testPlan.introduction || "Нет введения"}
                </Paragraph>
            </Card>

            <Card title="Подход">
                <Paragraph style={{marginBottom: 0}}>
                    {testPlan.approach || "Подход не обозначен"}
                </Paragraph>
            </Card>

            <Card title="Тест-кейсы">
                {testPlan.cases?.length ? (
                    <Table<ICaseCompact>
                        rowKey="id"
                        columns={caseColumns}
                        dataSource={testPlan.cases ?? []}
                        pagination={{pageSize: 10}}
                        onRow={record => ({
                            onClick: () => navigate(`/cases/${record.id}`),
                            style: {cursor: "pointer"},
                        })}
                    />
                ) : (
                    <Text type="secondary">Кейсов нет</Text>
                )}
            </Card>

            <Card title="Итоги прогонов">
                {totalRuns > 0 ? (
                    <Space direction="vertical" size="large" style={{width: "100%"}}>
                        <Progress percent={successRate} status={successRate === 100 ? "success" : "active"}/>
                        <Space size="large" wrap>
                            <Statistic title="Всего" value={totalRuns}/>
                            <Statistic title="Успешно" value={passedRuns} valueStyle={{color: "#3f8600"}}/>
                            <Statistic title="Провалено" value={failedRuns} valueStyle={{color: "#cf1322"}}/>
                            <Statistic title="Сломано" value={brokenRuns}/>
                            <Statistic title="Пропущено" value={skippedRuns}/>
                        </Space>
                    </Space>
                ) : (
                    <Text type="secondary">Прогонов пока нет</Text>
                )}
            </Card>

            <Card
                title="Прогоны этого плана"
                extra={
                    <Button type="primary" icon={<PlusOutlined/>} onClick={() => setIsCreateRunModalOpen(true)}>
                        Добавить прогон
                    </Button>
                }
            >
                {runs?.length ? (
                    <Table<IRun>
                        rowKey="id"
                        columns={runColumns}
                        dataSource={runs}
                        pagination={{pageSize: 10}}
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
                {!testPlan.cases?.length ? (
                    <Alert
                        type="warning"
                        showIcon
                        message="В плане нет тест-кейсов"
                        description="Добавьте хотя бы один тест-кейс в план, чтобы сохранить прогон."
                    />
                ) : (
                    <Form<CreateRunFormValues>
                        form={createRunForm}
                        layout="vertical"
                        onFinish={handleCreateRun}
                        initialValues={{
                            caseId: testPlan.cases[0].id,
                        }}
                    >
                        <Form.Item
                            name="caseId"
                            label="Тест-кейс"
                            rules={[{required: true, message: "Выберите тест-кейс"}]}
                        >
                            <Select
                                options={(testPlan.cases ?? []).map(testCase => ({
                                    value: testCase.id,
                                    label: `${testCase.id} - ${testCase.title}`,
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
