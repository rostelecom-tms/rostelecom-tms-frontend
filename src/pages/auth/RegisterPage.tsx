import { Button, Card, Form, Input, InputNumber, Typography, App } from 'antd'
import { useNavigate } from "react-router";
import userService from "../../services/user/userService.ts";
import type { IUserRegistrationRequest } from "../../models/user/user.ts";

const { Title, Text } = Typography

export const RegisterPage = () => {
    const navigate = useNavigate()
    const { message } = App.useApp()

    const onFinish = async (values: IUserRegistrationRequest) => {
        try {
            await userService.register(values)
            message.success('Заявка на регистрацию отправлена! Ожидайте одобрения.')
            navigate('/login')
        } catch (e) {
            message.error('Ошибка при регистрации')
        }
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
                    Регистрация
                </Title>

                <Text
                    type="secondary"
                    style={{
                        display: 'block',
                        textAlign: 'center',
                        marginBottom: 24,
                    }}
                >
                    Заполните данные для заявки
                </Text>

                <Form<IUserRegistrationRequest>
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
                        label="Имя пользователя"
                        name="username"
                        rules={[{ required: true, message: 'Введите имя пользователя' }]}
                    >
                        <Input placeholder="username" />
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
                            Зарегистрироваться
                        </Button>
                        <Button type="link" block onClick={() => navigate('/login')} style={{ marginTop: 8 }}>
                            Уже есть аккаунт? Войти
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    )
}