import { Button, Card, Form, Input, Typography } from 'antd'
import { useEffect, useMemo } from 'react'
import userService from "../../services/user/userService.ts";
import type {IUserLoginRequest} from "../../models/user/user.ts";
import {Navigate, useNavigate} from "react-router";
import {useMe} from "../../hooks/user/userHooks.ts";

const { Title, Text } = Typography
const LOGIN_DRAFT_KEY = 'login-form-draft'

const readLoginDraft = (): Partial<IUserLoginRequest> => {
    try {
        const savedDraft = sessionStorage.getItem(LOGIN_DRAFT_KEY)
        return savedDraft ? JSON.parse(savedDraft) as Partial<IUserLoginRequest> : {}
    } catch {
        return {}
    }
}

export const LoginPage = () => {
    const navigate = useNavigate()
    const [form] = Form.useForm<IUserLoginRequest>()
    const initialValues = useMemo(() => readLoginDraft(), [])

    const { data: me, isLoading } = useMe()

    useEffect(() => {
        form.setFieldsValue(initialValues)
    }, [form, initialValues])

    if (isLoading) return <div/>

    if (me) {
        return <Navigate to={'/dashboard'} replace/>
    }

    const onFinish = async (credentials: IUserLoginRequest) => {
        await userService.login(credentials)
        sessionStorage.removeItem(LOGIN_DRAFT_KEY)
        navigate(`/dashboard`, {replace: true})
    }

    const onValuesChange = (_: unknown, allValues: IUserLoginRequest) => {
        sessionStorage.setItem(LOGIN_DRAFT_KEY, JSON.stringify(allValues))
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
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    onValuesChange={onValuesChange}
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
                        <Button type="link" block onClick={() => navigate('/register')} style={{ marginTop: 8 }}>
                            Нет аккаунта? Зарегистрироваться
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    )
}