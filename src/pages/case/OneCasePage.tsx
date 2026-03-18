import { ArrowLeftOutlined } from '@ant-design/icons'
import {Alert, Breadcrumb, Button, Card, Descriptions, List, Space, Spin, Typography} from 'antd'
import { Link, useNavigate, useParams } from 'react-router'
import { useCase } from '../../hooks/case/caseHooks.ts'

const { Title, Paragraph, Text } = Typography

export const OneCasePage = () => {
    const navigate = useNavigate()
    const { id } = useParams()

    const {data: testCase, isLoading, isError} = useCase(Number(id))

    if (isLoading) {
        return <Spin />
    }

    if (isError) {
        return <Alert type="error" title="Не удалось загрузить тест-кейс" />
    }

    if (testCase === undefined) {
        return <Alert type="error" title="Не удалось загрузить тест-кейс" />
    }

    return (
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
            <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
                <Breadcrumb
                    items={[
                        {
                            title: <Link to="/cases">Test Cases</Link>,
                        },
                        {
                            title: testCase.title,
                        },
                    ]}
                />

                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                    style={{ width: 'fit-content' }}
                >
                    Назад
                </Button>
            </Space>

            <Card>
                <Title level={2} style={{ marginTop: 0 }}>
                    {testCase.title}
                </Title>

                <Descriptions bordered column={1}>
                    <Descriptions.Item label="ID">
                        {testCase.id}
                    </Descriptions.Item>

                    <Descriptions.Item label="Название">
                        {testCase.title}
                    </Descriptions.Item>

                    <Descriptions.Item label="Группа">
                        {testCase.group?.name ?? testCase.group?.id ?? 'Не указана'}
                    </Descriptions.Item>

                    <Descriptions.Item label="Created At">
                        {new Date(testCase.createdAt).toLocaleString('ru-RU')}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Card title="Описание">
                <Paragraph style={{ marginBottom: 0 }}>
                    {testCase.description || 'Нет описания'}
                </Paragraph>
            </Card>

            <Card title="Предусловия">
                <Paragraph style={{ marginBottom: 0 }}>
                    {testCase.preconditions || 'Нет предусловий'}
                </Paragraph>
            </Card>

            <Card title="Постусловия">
                <Paragraph style={{ marginBottom: 0 }}>
                    {testCase.postconditions || 'Нет постусловий'}
                </Paragraph>
            </Card>

            <Card title="Шаги">
                {testCase.steps?.length ? (
                    <List
                        dataSource={testCase.steps}
                        renderItem={(step, index) => (
                            <List.Item>
                                <Space orientation="vertical" size="small" style={{ width: '100%' }}>
                                    <Text strong>Шаг {index + 1}</Text>

                                    <div>
                                        <Text strong>Действие: </Text>
                                        <Text>{step.action ?? '-'}</Text>
                                    </div>

                                    <div>
                                        <Text strong>Ожидаемый результат: </Text>
                                        <Text>{step.expectedResult ?? '-'}</Text>
                                    </div>
                                </Space>
                            </List.Item>
                        )}
                    />
                ) : (
                    <Text type="secondary">Шагов нет</Text>
                )}
            </Card>
        </Space>
    )
}