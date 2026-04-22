import {Alert, App, Button, Card, Checkbox, Form, Input, Modal, Select, Space, Spin, Table, Tag, Typography} from "antd";
import {useMemo, useState} from "react";
import type {ColumnsType} from "antd/es/table";
import Title from "antd/lib/typography/Title";
import {useCases} from "../../hooks/case/caseHooks.ts";
import {useCreateDefect, useDefects, useUpdateDefect} from "../../hooks/case/defectHooks.ts";
import {useAiProviders, useAnalyzeLogs, useSimilarDefects} from "../../hooks/ai/aiHooks.ts";
import type {IDefect, IDefectCreateRequest} from "../../models/case/defect.ts";
import {getAiErrorMessage} from "../../utils/aiErrors.ts";

const {Text} = Typography;
const {TextArea} = Input;

interface CreateDefectFormValues {
    caseId: number;
    title: string;
    description?: string;
}

interface AnalyzeLogsFormValues {
    logs: string;
}

export const DefectsListPage = () => {
    const {message} = App.useApp();
    const {data: defects, isLoading, isError} = useDefects();
    const {data: cases, isLoading: isCasesLoading, isError: isCasesError} = useCases();
    const createDefectMutation = useCreateDefect();
    const updateDefectMutation = useUpdateDefect();
    const analyzeLogsMutation = useAnalyzeLogs();
    const {data: aiProviders, isError: isAiProvidersError} = useAiProviders();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [selectedDefect, setSelectedDefect] = useState<IDefect | null>(null);
    const [onlySolvedForSimilar, setOnlySolvedForSimilar] = useState(false);
    const [isSimilarSearchRun, setIsSimilarSearchRun] = useState(false);
    const [createForm] = Form.useForm<CreateDefectFormValues>();
    const [logsForm] = Form.useForm<AnalyzeLogsFormValues>();

    const {
        data: similarDefects,
        isFetching: isSimilarLoading,
        refetch: refetchSimilarDefects,
    } = useSimilarDefects(
        selectedDefect?.id,
        {
            limit: 5,
            onlySolved: onlySolvedForSimilar,
        },
        {
            enabled: false,
        }
    );

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
        {
            title: "AI",
            key: "ai",
            width: 180,
            render: (_, record) => (
                <Button
                    onClick={() => {
                        setSelectedDefect(record);
                        setOnlySolvedForSimilar(false);
                        setIsSimilarSearchRun(false);
                        logsForm.resetFields();
                        analyzeLogsMutation.reset();
                        setIsAiModalOpen(true);
                    }}
                >
                    AI-анализ
                </Button>
            ),
        },
    ];

    const openCreateModal = () => {
        createForm.resetFields();
        setIsCreateModalOpen(true);
    };

    const runSimilarSearch = async () => {
        if (!selectedDefect) {
            return;
        }

        setIsSimilarSearchRun(true);
        const result = await refetchSimilarDefects();
        if (result.error) {
            message.error(getAiErrorMessage(result.error, "Не удалось выполнить векторный поиск"));
        }
    };

    const runAiLogsAnalysis = (values: AnalyzeLogsFormValues) => {
        if (!selectedDefect) {
            return;
        }

        const logs = values.logs?.trim();
        if (!logs) {
            message.warning("Введите логи для анализа");
            return;
        }

        const prompt = [
            `Дефект: ${selectedDefect.title}`,
            selectedDefect.description ? `Описание дефекта: ${selectedDefect.description}` : "",
            "Логи:",
            logs,
            "Дай краткий анализ: вероятная причина, шаги проверки, что исправить.",
        ]
            .filter(Boolean)
            .join("\n\n");

        analyzeLogsMutation.mutate(
            {
                prompt,
            },
            {
                onError: () => {
                    message.error(getAiErrorMessage(
                        analyzeLogsMutation.error,
                        "Не удалось выполнить AI-анализ логов"
                    ));
                },
            }
        );
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
                    <Space>
                        {isAiProvidersError ? (
                            <Tag color="error">AI: недоступно</Tag>
                        ) : aiProviders ? (
                            <Tag color="processing">
                                AI: {aiProviders.defaultProvider} ({aiProviders.supportedProviders.join(", ")})
                            </Tag>
                        ) : (
                            <Tag>AI: проверка...</Tag>
                        )}

                        <Button type="primary" onClick={openCreateModal}>
                            Создать дефект
                        </Button>
                    </Space>
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

            <Modal
                title={selectedDefect ? `AI-анализ дефекта #${selectedDefect.id}` : "AI-анализ дефекта"}
                open={isAiModalOpen}
                onCancel={() => setIsAiModalOpen(false)}
                footer={null}
                width={900}
                destroyOnClose
            >
                {selectedDefect ? (
                    <Space direction="vertical" size={16} style={{width: "100%"}}>
                        <Card size="small" title="Текущий дефект">
                            <Space direction="vertical" size={6} style={{width: "100%"}}>
                                <Text><Text strong>ID:</Text> {selectedDefect.id}</Text>
                                <Text><Text strong>Заголовок:</Text> {selectedDefect.title}</Text>
                                <Text><Text strong>Описание:</Text> {selectedDefect.description?.trim() || "Описание не указано"}</Text>
                                <Text><Text strong>Решен:</Text> {selectedDefect.isSolved ? "Да" : "Нет"}</Text>
                            </Space>
                        </Card>

                        <Card
                            size="small"
                            title="Похожие дефекты (векторный поиск)"
                            extra={
                                <Space>
                                    <Checkbox
                                        checked={onlySolvedForSimilar}
                                        onChange={(event) => {
                                            setOnlySolvedForSimilar(event.target.checked);
                                            setIsSimilarSearchRun(false);
                                        }}
                                    >
                                        Только решенные
                                    </Checkbox>
                                    <Button type="primary" onClick={runSimilarSearch} loading={isSimilarLoading}>
                                        Найти
                                    </Button>
                                </Space>
                            }
                        >
                            {isSimilarLoading ? (
                                <Spin />
                            ) : !isSimilarSearchRun ? (
                                <Text type="secondary">Нажмите "Найти" для векторного поиска</Text>
                            ) : similarDefects?.length ? (
                                <Space direction="vertical" size={8} style={{width: "100%"}}>
                                    {similarDefects.map(item => (
                                        <Card key={item.defectId} size="small">
                                            <Space direction="vertical" size={4} style={{width: "100%"}}>
                                                <Text><Text strong>Defect ID:</Text> {item.defectId}</Text>
                                                <Text><Text strong>Case ID:</Text> {item.caseId}</Text>
                                                <Text><Text strong>Решен:</Text> {item.isSolved ? "Да" : "Нет"}</Text>
                                                <Text><Text strong>Score:</Text> {item.score.toFixed(3)}</Text>
                                            </Space>
                                        </Card>
                                    ))}
                                </Space>
                            ) : (
                                <Text type="secondary">Похожих дефектов пока не найдено</Text>
                            )}
                        </Card>

                        <Card size="small" title="AI-анализ логов">
                            <Form form={logsForm} layout="vertical" onFinish={runAiLogsAnalysis}>
                                <Form.Item
                                    label="Логи / stacktrace"
                                    name="logs"
                                    rules={[{required: true, message: "Вставьте текст логов"}]}
                                >
                                    <TextArea rows={8} placeholder="Вставьте фрагмент логов для анализа" />
                                </Form.Item>
                                <Space>
                                    <Button type="primary" htmlType="submit" loading={analyzeLogsMutation.isPending}>
                                        Анализировать логи
                                    </Button>
                                </Space>
                            </Form>

                            {analyzeLogsMutation.isSuccess && (
                                <Typography.Paragraph style={{whiteSpace: "pre-wrap", marginTop: 12, marginBottom: 0}}>
                                    {analyzeLogsMutation.data.answer}
                                </Typography.Paragraph>
                            )}
                        </Card>
                    </Space>
                ) : (
                    <Text type="secondary">Выберите дефект для анализа</Text>
                )}
            </Modal>
        </>
    );
};
