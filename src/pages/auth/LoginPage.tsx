import { Button, Card, Form, Input, Typography } from 'antd'
import userService from "../../services/user/userService.ts";
import type {IUserLoginRequest} from "../../models/user/user.ts";
import {Navigate, useNavigate} from "react-router";
import {useMe} from "../../hooks/user/userHooks.ts";

const { Title, Text } = Typography

export const LoginPage = () => {
    const navigate = useNavigate()

    const { data: me, isLoading } = useMe()

    if (isLoading) return <div/>

    if (me) {
        return <Navigate to={'/dashboard'} replace/>
    }

    const onFinish = async (credentials: IUserLoginRequest) => {
        await userService.login(credentials)
        navigate(`/dashboard`, {replace: true})
    }

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#f5f5f5',
            }}
        >
            <Card style={{ width: 400 }}>
                <Title level={2} style={{ textAlign: 'center', marginBottom: 8 }}>
                    Вход
                </Title>

                <Text
                    type="secondary"
                    style={{
                        display: 'block',
                        textAlign: 'center',
                        marginBottom: 24,
                    }}
                >
                    Введите email и пароль
                </Text>

                <Form<IUserLoginRequest>
                    layout="vertical"
                    onFinish={onFinish}
                    autoComplete="off"
                >
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Введите email' },
                            { type: 'email', message: 'Некорректный email' },
                        ]}
                    >
                        <Input placeholder="example@mail.com" />
                    </Form.Item>

                    <Form.Item
                        label="Пароль"
                        name="password"
                        rules={[
                            { required: true, message: 'Введите пароль' },
                            { min: 6, message: 'Минимум 6 символов' },
                        ]}
                    >
                        <Input.Password placeholder="Введите пароль" />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Button type="primary" htmlType="submit" block>
                            Войти
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    )
}