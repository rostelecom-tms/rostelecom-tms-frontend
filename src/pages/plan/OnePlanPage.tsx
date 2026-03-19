import { ArrowLeftOutlined } from '@ant-design/icons'
import {
    Alert,
    Breadcrumb,
    Button,
    Card,
    Descriptions,
    Popconfirm,
    Space,
    Spin,
    Table,
    Typography,
    App
} from 'antd'
import { Link, useNavigate, useParams } from 'react-router'
import {useDeletePlan, usePlan} from "../../hooks/plan/planHooks.ts";
import type {ColumnsType} from "antd/es/table";
import type {ICaseCompact} from "../../models/case/case.ts";

const { Title, Paragraph, Text } = Typography

export const OnePlanPage = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const planId = Number(id)
    const {message} = App.useApp()

    const {data: testPlan, isLoading, isError} = usePlan(planId)
    const deletePlanMutation = useDeletePlan()

    if (isLoading) {
        return <Spin />
    }

    if (isError || testPlan === undefined) {
        return <Alert type="error" title="Не удалось загрузить тест-план" />
    }

    const responsibleUserText = (() => {
        const user = testPlan.responsibleUser

        if (!user) {
            return 'Не указан'
        }

        if (!user.username) {
            return user.email
        }

        return `${user.username} (${user.email})`
    })()

    const columns: ColumnsType<ICaseCompact> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 100,
        },
        {
            title: 'Название',
            dataIndex: 'title',
            key: 'title',
        },
    ]

    const handleDelete = () => {
        navigate('/plans', {replace: true})
        deletePlanMutation.mutate(planId, {
            onSuccess: () => {
                message.success('Тест-план удалён').then()
            },
        })
    }

    return (
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
            <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
                <Breadcrumb
                    items={[
                        {
                            title: <Link to="/plans">Test Plans</Link>,
                        },
                        {
                            title: testPlan.name,
                        },
                    ]}
                />

                <Space>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(-1)}
                    >
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
                <Title level={2} style={{ marginTop: 0 }}>
                    {testPlan.name}
                </Title>

                <Descriptions bordered column={1}>
                    <Descriptions.Item label="ID">
                        {testPlan.id}
                    </Descriptions.Item>

                    <Descriptions.Item label="Название">
                        {testPlan.name}
                    </Descriptions.Item>

                    <Descriptions.Item label="Начало">
                        {new Date(testPlan.startDate).toLocaleString('ru-RU')}
                    </Descriptions.Item>

                    <Descriptions.Item label="Конец">
                        {new Date(testPlan.endDate).toLocaleString('ru-RU')}
                    </Descriptions.Item>

                    <Descriptions.Item label="Создан">
                        {new Date(testPlan.createdAt).toLocaleString('ru-RU')}
                    </Descriptions.Item>

                    <Descriptions.Item label="Ответственный">
                        {responsibleUserText}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Card title="Введение">
                <Paragraph style={{ marginBottom: 0 }}>
                    {testPlan.introduction || 'Нет введения'}
                </Paragraph>
            </Card>

            <Card title="Подход">
                <Paragraph style={{ marginBottom: 0 }}>
                    {testPlan.approach || 'Подход не обозначен'}
                </Paragraph>
            </Card>

            <Card title="Тест-кейсы">
                {testPlan.cases?.length ? (
                    <Table<ICaseCompact>
                        rowKey="id"
                        columns={columns}
                        dataSource={testPlan.cases ?? []}
                        pagination={{ pageSize: 10 }}
                        onRow={record => ({
                            onClick: () => navigate(`/cases/${record.id}`),
                            style: { cursor: 'pointer' },
                        })}
                    />
                ) : (
                    <Text type="secondary">Кейсов нет</Text>
                )}
            </Card>
        </Space>
    )
}