import {Button, DatePicker, Form, Input, Select, Space, Spin} from "antd";
import dayjs, {type Dayjs} from "dayjs";
import {useUsers} from "../../hooks/user/userHooks.ts";
import {useCases} from "../../hooks/case/caseHooks.ts";
import type {IPlan, IPlanUpdateRequest} from "../../models/plan/plan.ts";

const {TextArea} = Input;

export interface EditPlanSubmitValues {
    request: IPlanUpdateRequest
    caseIds: number[]
}

interface EditPlanFormValues {
    name?: string
    introduction?: string
    approach?: string
    startDate?: Dayjs
    endDate?: Dayjs
    responsibleUserId?: number
    caseIds: number[]
}

interface EditPlanFormProps {
    initialValues: IPlan
    loading?: boolean
    onSubmit: (values: EditPlanSubmitValues) => void
}

export const EditPlanForm = ({
                                 initialValues,
                                 loading,
                                 onSubmit,
                             }: EditPlanFormProps) => {
    const [form] = Form.useForm<EditPlanFormValues>()
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
                name: initialValues.name,
                introduction: initialValues.introduction,
                approach: initialValues.approach,
                startDate: initialValues.startDate ? dayjs(initialValues.startDate) : undefined,
                endDate: initialValues.endDate ? dayjs(initialValues.endDate) : undefined,
                responsibleUserId: initialValues.responsibleUser?.id,
                caseIds: initialValues.cases?.map(testCase => testCase.id) ?? [],
            }}
            onFinish={(values) => {
                onSubmit({
                    request: {
                        name: values.name,
                        introduction: values.introduction,
                        approach: values.approach,
                        startDate: values.startDate?.format("YYYY-MM-DD"),
                        endDate: values.endDate?.format("YYYY-MM-DD"),
                        responsibleUserId: values.responsibleUserId,
                    },
                    caseIds: values.caseIds ?? [],
                })
            }}
        >
            <Form.Item label="Название" name="name">
                <Input />
            </Form.Item>

            <Form.Item label="Введение" name="introduction">
                <TextArea rows={4} />
            </Form.Item>

            <Form.Item label="Подход" name="approach">
                <TextArea rows={4} />
            </Form.Item>

            <Form.Item label="Дата начала" name="startDate">
                <DatePicker showTime={{format: "HH:mm"}} format="DD.MM.YYYY HH:mm" style={{width: "100%"}} />
            </Form.Item>

            <Form.Item label="Дата окончания" name="endDate">
                <DatePicker showTime={{format: "HH:mm"}} format="DD.MM.YYYY HH:mm" style={{width: "100%"}} />
            </Form.Item>

            <Form.Item label="Ответственный" name="responsibleUserId">
                <Select
                    placeholder="Выберите пользователя"
                    options={(users ?? []).map(user => ({
                        value: user.id,
                        label: user.username
                            ? `${user.username} (${user.email})`
                            : user.email,
                    }))}
                    showSearch={{
                        optionFilterProp: "label",
                    }}
                    allowClear
                />
            </Form.Item>

            <Form.Item label="Тест-кейсы" name="caseIds">
                <Select
                    mode="multiple"
                    placeholder="Выберите тест-кейсы"
                    options={(cases ?? []).map(testCase => ({
                        value: testCase.id,
                        label: `${testCase.id} - ${testCase.title}`,
                    }))}
                    showSearch={{
                        optionFilterProp: "label",
                    }}
                />
            </Form.Item>

            <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                    Сохранить
                </Button>
            </Space>
        </Form>
    )
}