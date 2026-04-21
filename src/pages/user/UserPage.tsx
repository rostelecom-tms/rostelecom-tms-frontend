import {Alert, Card, Descriptions, Spin, Tag, Typography} from "antd";
import {useMe} from "../../hooks/user/userHooks.ts";

const {Title} = Typography

export const UserPage = () => {
    const {data: me, isLoading, isError} = useMe()

    if (isLoading) {
        return <Spin />
    }

    if (isError || !me) {
        return <Alert type="error" title="Не удалось загрузить профиль" />
    }

    return (
        <Card>
            <Title level={2}>Профиль</Title>

            <Descriptions bordered column={1}>
                <Descriptions.Item label="ID">{me.id}</Descriptions.Item>
                <Descriptions.Item label="Email">{me.email}</Descriptions.Item>
                <Descriptions.Item label="Имя пользователя">{me.username}</Descriptions.Item>
                <Descriptions.Item label="Роль">
                    <Tag>{me.role.name} ({me.role.slug})</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Создание планов">
                    {me.canCreatePlans ? <Tag color="success">Разрешено</Tag> : <Tag>Не разрешено</Tag>}
                </Descriptions.Item>
                <Descriptions.Item label="Создан">
                    {new Date(me.createdAt).toLocaleString("ru-RU")}
                </Descriptions.Item>
            </Descriptions>
        </Card>
    )
}