import {Alert, App, Button, Card, Checkbox, Form, Input, Modal, Select, Space, Spin, Table, Tag, Typography} from "antd";
import {useMemo, useState} from "react";
import type {ColumnsType} from "antd/es/table";
import Title from "antd/lib/typography/Title";
import {useCases} from "../../hooks/case/caseHooks.ts";
import {useCreateDefect, useDefects, useUpdateDefect} from "../../hooks/case/defectHooks.ts";
import type {IDefect, IDefectCreateRequest} from "../../models/case/defect.ts";

const {Text} = Typography;
const {TextArea} = Input;

interface CreateDefectFormValues {
    caseId: number;
    title: string;
    description?: string;
}

export const DefectsListPage = () => {
    const {message} = App.useApp();
    const {data: defects, isLoading, isError} = useDefects();
    const {data: cases, isLoading: isCasesLoading, isError: isCasesError} = useCases();
    const createDefectMutation = useCreateDefect();
    const updateDefectMutation = useUpdateDefect();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createForm] = Form.useForm<CreateDefectFormValues>();

    const caseOptions = useMemo(
        () => (cases ?? []).map(testCase => ({
            value: testCase.id,
            label: testCase.title,
        })),
        [cases]
    );

    const columns: ColumnsType<IDefect> = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 90,
        },
        {
            title: "Кейс",
            dataIndex: "caseTitle",
            key: "caseTitle",
            render: (value: string, record) => value || `Case #${record.caseId}`,
        },
        {
            title: "Дефект",
            dataIndex: "title",
            key: "title",
        },
        {
            title: "Статус",
            key: "isSolved",
            dataIndex: "isSolved",
            width: 220,
            render: (_: boolean, record) => (
                <Space size={8}>
                    <Tag color={record.isSolved ? "success" : "warning"}>
                        {record.isSolved ? "Решен" : "Не решен"}
                    </Tag>
                    <Checkbox
                        checked={record.isSolved}
                        onChange={(event) => {
                            updateDefectMutation.mutate(
                                {
                                    id: record.id,
                                    request: {isSolved: event.target.checked},
                                },
                                {
                                    onSuccess: () => {
                                        message.success("Статус дефекта обновлен");
                                    },
                                    onError: () => {
                                        message.error("Не удалось обновить статус дефекта");
                                    },
                                }
                            );
                        }}
                    >
                        Решен
                    </Checkbox>
                </Space>
            ),
        },
        {
            title: "Создан",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 200,
            render: (value: string) => new Date(value).toLocaleString("ru-RU"),
        },
    ];

    const openCreateModal = () => {
        createForm.resetFields();
        setIsCreateModalOpen(true);
    };

    const handleCreate = (values: CreateDefectFormValues) => {
        const request: IDefectCreateRequest = {
            caseId: values.caseId,
            title: values.title.trim(),
            description: values.description?.trim() || undefined,
        };

        createDefectMutation.mutate(request, {
            onSuccess: () => {
                message.success("Дефект создан");
                setIsCreateModalOpen(false);
                createForm.resetFields();
            },
            onError: () => {
                message.error("Не удалось создать дефект");
            },
        });
    };

    if (isLoading || isCasesLoading) {
        return <Spin/>;
    }

    if (isError || isCasesError || !defects || !cases) {
        return <Alert type="error" title="Не удалось загрузить дефекты"/>;
    }

    return (
        <>
            <Card>
                <Space style={{width: "100%", justifyContent: "space-between", marginBottom: 16}}>
                    <Title level={2} style={{margin: 0}}>Дефекты</Title>
                    <Button type="primary" onClick={openCreateModal}>
                        Создать дефект
                    </Button>
                </Space>

                <Table<IDefect>
                    rowKey="id"
                    columns={columns}
                    dataSource={defects}
                    pagination={{pageSize: 10}}
                    expandable={{
                        expandedRowRender: (record) => (
                            <Space direction="vertical" size={8} style={{width: "100%"}}>
                                <Text strong>Описание</Text>
                                <Text>{record.description?.trim() ? record.description : "Описание не указано"}</Text>
                            </Space>
                        ),
                        rowExpandable: () => true,
                    }}
                />
            </Card>

            <Modal
                title="Создать дефект"
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
                onOk={() => createForm.submit()}
                okText="Создать"
                confirmLoading={createDefectMutation.isPending}
                destroyOnClose
            >
                <Form form={createForm} layout="vertical" onFinish={handleCreate}>
                    <Form.Item
                        label="Тест-кейс"
                        name="caseId"
                        rules={[{required: true, message: "Выберите тест-кейс"}]}
                    >
                        <Select
                            showSearch
                            placeholder="Выберите тест-кейс"
                            optionFilterProp="label"
                            options={caseOptions}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Название"
                        name="title"
                        rules={[{required: true, message: "Введите название дефекта"}]}
                    >
                        <Input maxLength={500}/>
                    </Form.Item>

                    <Form.Item label="Описание" name="description">
                        <TextArea rows={4}/>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};
