import {Alert, Button, Card, Descriptions, Spin, Tag, Typography, Popconfirm} from "antd"; // Добавь Button и Popconfirm
import {LogoutOutlined} from "@ant-design/icons"; // Для красоты
import {useMe, useLogout} from "../../hooks/user/userHooks.ts"; // Импортируй хук

const {Title} = Typography

export const UserPage = () => {
    const {data: me, isLoading, isError} = useMe()
    const logoutMutation = useLogout(); // Инициализируем хук

    if (isLoading) return <Spin />
    if (isError || !me) return <Alert type="error" title="Не удалось загрузить профиль" />

    return (
        <Card
            title={<Title level={2} style={{margin: 0}}>Профиль</Title>}
            extra={
                <Popconfirm
                    title="Выход из аккаунта"
                    description="Вы уверены, что хотите выйти?"
                    onConfirm={() => logoutMutation.mutate()}
                    okText="Да"
                    cancelText="Нет"
                >
                    <Button
                        danger
                        icon={<LogoutOutlined />}
                        loading={logoutMutation.isPending}
                    >
                        Выйти
                    </Button>
                </Popconfirm>
            }
        >
            <Descriptions bordered column={1}>
                {/* ... твои существующие Descriptions.Item ... */}
                <Descriptions.Item label="ID">{me.id}</Descriptions.Item>
                <Descriptions.Item label="Email">{me.email}</Descriptions.Item>
                <Descriptions.Item label="Имя пользователя">{me.username}</Descriptions.Item>
                <Descriptions.Item label="Роль">
                    <Tag>{me.role.name} ({me.role.slug})</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Создание проектов">
                    {me.canCreatePlans ? <Tag color="success">Разрешено</Tag> : <Tag>Не разрешено</Tag>}
                </Descriptions.Item>
                <Descriptions.Item label="Создан">
                    {new Date(me.createdAt).toLocaleString("ru-RU")}
                </Descriptions.Item>
            </Descriptions>
        </Card>
    )
}