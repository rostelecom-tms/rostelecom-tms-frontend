import {Button, Form, Input, Select, Space} from "antd";
import {MinusCircleOutlined, PlusOutlined} from "@ant-design/icons";
import type {ICase, ICaseUpdateRequest} from "../../models/case/case.ts";
import type {IGroup} from "../../models/case/group.ts";
import {buildGroupOptions} from "../../utils/caseGroupTree.ts";

const {TextArea} = Input;

interface CaseStepFormValue {
    title?: string
    action?: string
    expectedResult?: string
}

interface EditCaseFormValues {
    title?: string
    groupId?: number
    description?: string
    preconditions?: string
    postconditions?: string
    tags?: string[]
    steps: CaseStepFormValue[]
}

export interface EditCaseSubmitValues {
    request: ICaseUpdateRequest
}

interface EditCaseFormProps {
    initialValues: ICase
    groups: IGroup[]
    existingTags?: string[]
    loading?: boolean
    onSubmit: (values: EditCaseSubmitValues) => void
}

export const EditCaseForm = ({
    initialValues,
    groups,
    existingTags = [],
    loading,
    onSubmit,
}: EditCaseFormProps) => {
    const [form] = Form.useForm<EditCaseFormValues>()
    const groupOptions = buildGroupOptions(groups)

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={{
                title: initialValues.title,
                groupId: initialValues.group?.id,
                description: initialValues.description,
                preconditions: initialValues.preconditions,
                postconditions: initialValues.postconditions,
                tags: initialValues.tags ?? [],
                steps: initialValues.steps?.map(step => ({
                    title: step.title,
                    action: step.action,
                    expectedResult: step.expectedResult,
                })) ?? [],
            }}
            onFinish={(values) => {
                onSubmit({
                    request: {
                        title: values.title,
                        groupId: values.groupId,
                        description: values.description,
                        preconditions: values.preconditions,
                        postconditions: values.postconditions,
                        tags: values.tags?.map(tag => tag.trim()).filter(Boolean),
                        steps: (values.steps ?? []).map((step, index) => ({
                            order: index + 1,
                            title: step.title?.trim() || `Шаг ${index + 1}`,
                            action: step.action?.trim(),
                            expectedResult: step.expectedResult?.trim(),
                        })),
                    },
                })
            }}
        >
            <Form.Item label="Название" name="title">
                <Input />
            </Form.Item>

            <Form.Item
                label="Группа"
                name="groupId"
                rules={[{required: true, message: "Укажите группу"}]}
            >
                <Select
                    placeholder="Выберите группу"
                    options={groupOptions}
                />
            </Form.Item>

            <Form.Item label="Описание" name="description">
                <TextArea rows={4} />
            </Form.Item>

            <Form.Item label="Предусловия" name="preconditions">
                <TextArea rows={4} />
            </Form.Item>

            <Form.Item label="Постусловия" name="postconditions">
                <TextArea rows={4} />
            </Form.Item>

            <Form.Item label="Теги" name="tags">
                <Select
                    mode="tags"
                    tokenSeparators={[","]}
                    placeholder="Например: smoke, api, regression"
                    maxTagCount="responsive"
                    options={existingTags.map(tag => ({value: tag, label: tag}))}
                />
            </Form.Item>

            <Form.List name="steps">
                {(fields, {add, remove}) => (
                    <Space orientation="vertical" size="middle" style={{width: "100%"}}>
                        {fields.map((field, index) => (
                            <Space
                                key={field.key}
                                orientation="vertical"
                                size="small"
                                style={{width: "100%", padding: 16, border: "1px solid #f0f0f0", borderRadius: 8}}
                            >
                                <Space style={{width: "100%", justifyContent: "space-between"}}>
                                    <span>Шаг {index + 1}</span>
                                    <Button
                                        danger
                                        type="text"
                                        icon={<MinusCircleOutlined />}
                                        onClick={() => remove(field.name)}
                                    >
                                        Удалить
                                    </Button>
                                </Space>

                                <Form.Item
                                    label="Действие"
                                    name={[field.name, "action"]}
                                >
                                    <TextArea rows={3} />
                                </Form.Item>

                                <Form.Item
                                    label="Ожидаемый результат"
                                    name={[field.name, "expectedResult"]}
                                >
                                    <TextArea rows={3} />
                                </Form.Item>
                            </Space>
                        ))}

                        <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={() =>
                                add({
                                    title: `Шаг ${fields.length + 1}`,
                                    action: "",
                                    expectedResult: "",
                                })
                            }
                            block
                        >
                            Добавить шаг
                        </Button>
                    </Space>
                )}
            </Form.List>

            <Space style={{marginTop: 24}}>
                <Button type="primary" htmlType="submit" loading={loading}>
                    Сохранить
                </Button>
            </Space>
        </Form>
    )
}
