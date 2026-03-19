import {Button, DatePicker, Form, Input, Select, Space, Spin} from "antd";
import {type Dayjs} from "dayjs";
import {useUsers} from "../../hooks/user/userHooks.ts";
import {useCases} from "../../hooks/case/caseHooks.ts";
import type {IPlanCreateRequest} from "../../models/plan/plan.ts";

const {TextArea} = Input;

export interface CreatePlanSubmitValues {
    request: IPlanCreateRequest
    caseIds: number[]
}

interface CreatePlanFormValues {
    name: string
    introduction: string
    approach: string
    startDate: Dayjs
    endDate: Dayjs
    responsibleUserId?: number
    caseIds: number[]
}

interface CreatePlanFormProps {
    loading?: boolean
    onSubmit: (values: CreatePlanSubmitValues) => void
}

export const CreatePlanForm = ({loading, onSubmit}: CreatePlanFormProps) => {
    const [form] = Form.useForm<CreatePlanFormValues>()
    const {data: users, isLoading: isUsersLoading} = useUsers()
    const {data: cases, isLoading: isCasesLoading} = useCases()

    if (isUsersLoading || isCasesLoading) {
        return <Spin />
    }

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={{
                caseIds: [],
            }}
            onFinish={(values) => {
                onSubmit({
                    request: {
                        name: values.name,
                        introduction: values.introduction,
                        approach: values.approach,
                        startDate: values.startDate.toISOString(),
                        endDate: values.endDate.toISOString(),
                        responsibleUserId: values.responsibleUserId!,
                    },
                    caseIds: values.caseIds ?? [],
                })
            }}
        >
            <Form.Item
                label="Название"
                name="name"
                rules={[{required: true, message: "Введите название"}]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Введение"
                name="introduction"
                rules={[{required: true, message: "Введите введение"}]}
            >
                <TextArea rows={4} />
            </Form.Item>

            <Form.Item
                label="Подход"
                name="approach"
                rules={[{required: true, message: "Введите подход"}]}
            >
                <TextArea rows={4} />
            </Form.Item>

            <Form.Item
                label="Дата начала"
                name="startDate"
                rules={[{required: true, message: "Выберите дату начала"}]}
            >
                <DatePicker showTime style={{width: "100%"}} />
            </Form.Item>

            <Form.Item
                label="Дата окончания"
                name="endDate"
                rules={[{required: true, message: "Выберите дату окончания"}]}
            >
                <DatePicker showTime style={{width: "100%"}} />
            </Form.Item>

            <Form.Item
                label="Ответственный"
                name="responsibleUserId"
                rules={[{required: true, message: "Выберите ответственного"}]}
            >
                <Select
                    placeholder="Выберите пользователя"
                    options={(users ?? []).map(user => ({
                        value: user.id,
                        label: user.username
                            ? `${user.username} (${user.email})`
                            : user.email,
                    }))}
                    showSearch
                    optionFilterProp="label"
                />
            </Form.Item>

            <Form.Item
                label="Тест-кейсы"
                name="caseIds"
            >
                <Select
                    mode="multiple"
                    placeholder="Выберите тест-кейсы"
                    options={(cases ?? []).map(testCase => ({
                        value: testCase.id,
                        label: `${testCase.id} - ${testCase.title}`,
                    }))}
                    showSearch
                    optionFilterProp="label"
                />
            </Form.Item>

            <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                    Создать
                </Button>
            </Space>
        </Form>
    )
}