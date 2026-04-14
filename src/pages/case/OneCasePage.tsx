import {ArrowLeftOutlined} from '@ant-design/icons'
import {Alert, App, Breadcrumb, Button, Card, Descriptions, Popconfirm, Space, Spin, Table, Tag, Typography} from 'antd'
import {Link, useNavigate, useParams} from 'react-router'
import {useCase, useDeleteCase} from '../../hooks/case/caseHooks.ts'

const {Title, Paragraph, Text} = Typography

export const OneCasePage = () => {
    const navigate = useNavigate()
    const {id} = useParams()
    const caseId = Number(id)
    const {message} = App.useApp()

    const {data: testCase, isLoading, isError} = useCase(caseId)
    const deleteCaseMutation = useDeleteCase()

    if (isLoading) {
        return <Spin/>
    }

    if (isError || testCase === undefined) {
        return <Alert type="error" title="Не удалось загрузить тест-кейс"/>
    }

    const handleDelete = () => {
        navigate('/cases', {replace: true})
        deleteCaseMutation.mutate(caseId, {
            onSuccess: () => {
                message.success('Тест-кейс удалён').then()
            },
        })
    }

    return (
        <Space orientation="vertical" size="large" style={{width: '100%'}}>
            <Space orientation="vertical" size="middle" style={{width: '100%'}}>
                <Breadcrumb
                    items={[
                        {
                            title: <Link to="/cases">Тест-кейсы и группы</Link>,
                        },
                        {
                            title: testCase.title,
                        },
                    ]}
                />

                <Space>
                    <Button
                        icon={<ArrowLeftOutlined/>}
                        onClick={() => navigate(-1)}
                    >
                        Назад
                    </Button>

                    <Button onClick={() => navigate(`/cases/${caseId}/edit`)}>
                        Редактировать
                    </Button>

                    <Popconfirm
                        title="Удалить тест-кейс?"
                        description="Это действие нельзя отменить"
                        onConfirm={handleDelete}
                        okText="Удалить"
                        cancelText="Отмена"
                    >
                        <Button danger loading={deleteCaseMutation.isPending}>
                            Удалить
                        </Button>
                    </Popconfirm>
                </Space>
            </Space>

            <Card>
                <Title level={2} style={{marginTop: 0}}>
                    {testCase.title}
                </Title>

                <Descriptions bordered column={1}>
                    <Descriptions.Item label="ID">
                        {testCase.id}
                    </Descriptions.Item>

                    <Descriptions.Item label="Название">
                        {testCase.title}
                    </Descriptions.Item>

                    <Descriptions.Item label="Группа">
                        {testCase.group?.name ?? testCase.group?.id ?? 'Не указана'}
                    </Descriptions.Item>

                    <Descriptions.Item label="Теги">
                        {testCase.tags?.length
                            ? testCase.tags.map(tag => <Tag key={tag}>{tag}</Tag>)
                            : 'Нет тегов'}
                    </Descriptions.Item>

                    <Descriptions.Item label="Создан">
                        {new Date(testCase.createdAt).toLocaleString('ru-RU')}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Card title="Описание">
                <Paragraph style={{marginBottom: 0}}>
                    {testCase.description || 'Нет описания'}
                </Paragraph>
            </Card>

            <Card title="Предусловия">
                <Paragraph style={{marginBottom: 0}}>
                    {testCase.preconditions || 'Нет предусловий'}
                </Paragraph>
            </Card>

            <Card title="Постусловия">
                <Paragraph style={{marginBottom: 0}}>
                    {testCase.postconditions || 'Нет постусловий'}
                </Paragraph>
            </Card>

            <Card title="Шаги">
                {testCase.steps?.length ? (
                    <Table
                        dataSource={testCase.steps}
                        rowKey={(step) => step.id}
                        pagination={false}
                        columns={[
                            {
                                title: '№',
                                render: (_, __, index) => index + 1,
                                width: 60,
                            },
                            {
                                title: 'Действие',
                                dataIndex: 'action',
                                key: 'action',
                                render: (text) => text || '-',
                            },
                            {
                                title: 'Ожидаемый результат',
                                dataIndex: 'expectedResult',
                                key: 'expectedResult',
                                render: (text) => text || '-',
                            },
                        ]}
                    />
                ) : (
                    <Text type="secondary">Шагов нет</Text>
                )}
            </Card>
        </Space>
    )
}
