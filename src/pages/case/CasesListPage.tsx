import {Alert, App, Button, Card, Empty, Form, Input, Modal, Select, Space, Spin, Tag, Tree, Typography} from "antd";
import {FolderOpenOutlined, FolderOutlined, FileTextOutlined} from "@ant-design/icons";
import {useMemo, useState} from "react";
import {useNavigate} from "react-router";
import type {DataNode} from "antd/es/tree";
import Title from "antd/lib/typography/Title";
import {useCases} from "../../hooks/case/caseHooks.ts";
import {useCreateGroup, useGroups} from "../../hooks/case/groupHooks.ts";
import type {ICaseCompact} from "../../models/case/case.ts";
import type {IGroup} from "../../models/case/group.ts";
import {buildGroupOptions, buildGroupPathMap} from "../../utils/caseGroupTree.ts";

const {Text} = Typography;

type ExplorerNode = DataNode & {
    kind: "group" | "case";
    groupId?: number;
    caseId?: number;
};

type SelectedNode =
    | { kind: "group"; id: number }
    | { kind: "case"; id: number; groupId: number };

interface CreateGroupFormValues {
    name: string;
    slug: string;
    parentId?: number;
}

const buildExplorerTree = (groups: IGroup[], cases: ICaseCompact[]): ExplorerNode[] => {
    const groupById = new Map(groups.map(group => [group.id, group]));
    const nodesByGroupId = new Map<number, ExplorerNode>();

    for (const group of groups) {
        nodesByGroupId.set(group.id, {
            key: `group-${group.id}`,
            title: (
                <Space size={8}>
                    <FolderOutlined />
                    <span>{group.name}</span>
                    <Tag color="blue">Group</Tag>
                </Space>
            ),
            kind: "group",
            groupId: group.id,
            children: [],
        });
    }

    for (const group of groups) {
        const currentNode = nodesByGroupId.get(group.id);
        if (!currentNode) {
            continue;
        }

        if (group.parentId != null) {
            const parentNode = nodesByGroupId.get(group.parentId);
            if (parentNode) {
                parentNode.children = [...(parentNode.children ?? []), currentNode];
            }
        }
    }

    for (const testCase of cases) {
        const caseNode: ExplorerNode = {
            key: `case-${testCase.id}`,
            title: (
                <Space size={8}>
                    <FileTextOutlined />
                    <span>{testCase.title}</span>
                    <Tag color="green">Case</Tag>
                    {(testCase.tags ?? []).map(tag => (
                        <Tag key={`${testCase.id}-${tag}`}>{tag}</Tag>
                    ))}
                </Space>
            ),
            isLeaf: true,
            kind: "case",
            caseId: testCase.id,
            groupId: testCase.groupId,
        };

        const parent = nodesByGroupId.get(testCase.groupId);
        if (parent) {
            parent.children = [...(parent.children ?? []), caseNode];
        }
    }

    return groups
        .filter(group => group.parentId == null || !groupById.has(group.parentId))
        .map(group => nodesByGroupId.get(group.id))
        .filter((node): node is ExplorerNode => Boolean(node));
};

export const CasesListPage = () => {
    const navigate = useNavigate();
    const {message} = App.useApp();
    const {data: cases, isLoading: isCasesLoading, isError: isCasesError} = useCases();
    const {data: groups, isLoading: isGroupsLoading, isError: isGroupsError} = useGroups();
    const createGroupMutation = useCreateGroup();

    const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);
    const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
    const [createGroupForm] = Form.useForm<CreateGroupFormValues>();

    const treeData = useMemo(
        () => buildExplorerTree(groups ?? [], cases ?? []),
        [groups, cases]
    );

    const pathByGroupId = useMemo(
        () => buildGroupPathMap(groups ?? []),
        [groups]
    );

    const groupOptions = useMemo(
        () => buildGroupOptions(groups ?? []),
        [groups]
    );

    const caseGroupByCaseId = useMemo(
        () => new Map((cases ?? []).map(testCase => [testCase.id, testCase.groupId])),
        [cases]
    );

    const defaultExpandedKeys = useMemo(
        () => (groups ?? []).filter(group => group.parentId == null).map(group => `group-${group.id}`),
        [groups]
    );

    const handleSelect = (selectedKeys: React.Key[]) => {
        const selectedKey = selectedKeys[0];
        if (!selectedKey) {
            setSelectedNode(null);
            return;
        }

        const key = String(selectedKey);
        if (key.startsWith("group-")) {
            const id = Number(key.replace("group-", ""));
            setSelectedNode({kind: "group", id});
            return;
        }

        if (key.startsWith("case-")) {
            const id = Number(key.replace("case-", ""));
            const groupId = caseGroupByCaseId.get(id);
            if (groupId != null) {
                setSelectedNode({kind: "case", id, groupId});
            }
        }
    };

    const openCreateGroupModal = () => {
        createGroupForm.resetFields();
        if (selectedNode?.kind === "group") {
            createGroupForm.setFieldValue("parentId", selectedNode.id);
        }
        setIsCreateGroupOpen(true);
    };

    const handleCreateGroup = (values: CreateGroupFormValues) => {
        createGroupMutation.mutate(
            {
                name: values.name.trim(),
                slug: values.slug.trim(),
                parentId: values.parentId,
            },
            {
                onSuccess: () => {
                    message.success("Группа создана");
                    setIsCreateGroupOpen(false);
                    createGroupForm.resetFields();
                },
                onError: () => {
                    message.error("Не удалось создать группу");
                },
            }
        );
    };

    if (isCasesLoading || isGroupsLoading) {
        return <Spin />;
    }

    if (isCasesError || isGroupsError || !cases || !groups) {
        return <Alert type="error" title="Не удалось загрузить дерево кейсов" />;
    }

    return (
        <>
            <Card>
                <Space style={{width: "100%", justifyContent: "space-between", marginBottom: 16}}>
                    <Title level={2} style={{margin: 0}}>Тест-кейсы и группы</Title>
                    <Space>
                        <Button onClick={openCreateGroupModal}>Добавить группу</Button>
                        <Button type="primary" onClick={() => navigate("/cases/create")}>
                            Создать кейс
                        </Button>
                    </Space>
                </Space>

                <Space align="start" size={24} style={{width: "100%"}}>
                    <div style={{flex: 1, minWidth: 320}}>
                        {treeData.length === 0 ? (
                            <Empty description="Нет групп и кейсов" />
                        ) : (
                            <Tree
                                showIcon
                                treeData={treeData}
                                onSelect={handleSelect}
                                defaultExpandedKeys={defaultExpandedKeys}
                                switcherIcon={({expanded}) => expanded ? <FolderOpenOutlined /> : <FolderOutlined />}
                            />
                        )}
                    </div>

                    <Card style={{width: 360}} title="Сведения">
                        {!selectedNode && <Text type="secondary">Выберите группу или кейс в дереве</Text>}

                        {selectedNode?.kind === "group" && (
                            <Space direction="vertical" size={8}>
                                <Text strong>Тип: Группа</Text>
                                <Text>ID: {selectedNode.id}</Text>
                                <Text>Путь: {pathByGroupId.get(selectedNode.id) ?? `Group #${selectedNode.id}`}</Text>
                            </Space>
                        )}

                        {selectedNode?.kind === "case" && (
                            <Space direction="vertical" size={8}>
                                <Text strong>Тип: Кейс</Text>
                                <Text>ID: {selectedNode.id}</Text>
                                <Text>Группа: {pathByGroupId.get(selectedNode.groupId) ?? `Group #${selectedNode.groupId}`}</Text>
                                <Button type="link" onClick={() => navigate(`/cases/${selectedNode.id}`)} style={{padding: 0}}>
                                    Открыть кейс
                                </Button>
                            </Space>
                        )}
                    </Card>
                </Space>
            </Card>

            <Modal
                title="Добавить группу"
                open={isCreateGroupOpen}
                onCancel={() => setIsCreateGroupOpen(false)}
                onOk={() => createGroupForm.submit()}
                okText="Создать"
                confirmLoading={createGroupMutation.isPending}
                destroyOnClose
            >
                <Form form={createGroupForm} layout="vertical" onFinish={handleCreateGroup}>
                    <Form.Item
                        label="Название"
                        name="name"
                        rules={[{required: true, message: "Введите название"}]}
                    >
                        <Input maxLength={255} />
                    </Form.Item>

                    <Form.Item
                        label="Slug"
                        name="slug"
                        rules={[
                            {required: true, message: "Введите slug"},
                            {pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: "Только lowercase, цифры и дефисы"},
                        ]}
                    >
                        <Input maxLength={255} placeholder="module-auth-smoke" />
                    </Form.Item>

                    <Form.Item
                        label="Родительская группа"
                        name="parentId"
                        extra="Если не указывать родителя, создастся корневая группа (может требовать права администратора)"
                    >
                        <Select
                            allowClear
                            placeholder="Без родителя"
                            options={groupOptions}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};
