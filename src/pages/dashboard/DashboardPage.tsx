import { Button, Card, Input, Space, Typography } from 'antd'

const { Title, Text } = Typography

export const DashboardPage = () => {
    return (
        <Card>
            <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
                <Title level={3}>TMS Dashboard</Title>
                <Text type="secondary">Быстрый старт по проекту</Text>
                <Input placeholder="Поиск тест-кейсов" />
                <Button type="primary">Создать тест-кейс</Button>
            </Space>
        </Card>
    )
}