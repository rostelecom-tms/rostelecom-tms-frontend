import {Alert, Card, Col, Progress, Row, Space, Spin, Statistic, Table, Tag, Typography} from "antd";
import type {ColumnsType} from "antd/es/table";
import {ArrowDownOutlined, ArrowUpOutlined, MinusOutlined} from "@ant-design/icons";
import {Link} from "react-router";
import type {ReactNode} from "react";
import {Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {useDashboard} from "../../hooks/dashboard/dashboardHooks.ts";
import type {IDashboardRecentPlan, IDashboardRecentRun} from "../../models/dashboard/dashboard.ts";
import {getRunStatusColor} from "../../utils/runPresentation.ts";

const {Title, Text} = Typography

const trendLabelMap: Record<string, {label: string; color: string; icon: ReactNode}> = {
    UP: {label: "Тренд вверх", color: "#3f8600", icon: <ArrowUpOutlined/>},
    DOWN: {label: "Тренд вниз", color: "#cf1322", icon: <ArrowDownOutlined/>},
    STABLE: {label: "Без изменений", color: "#595959", icon: <MinusOutlined/>},
}

export const DashboardPage = () => {
    const {data, isLoading, isError} = useDashboard()

    if (isLoading) {
        return <Spin/>
    }

    if (isError || !data) {
        return <Alert type="error" title="Не удалось загрузить дашборд"/>
    }

    const recentRunsColumns: ColumnsType<IDashboardRecentRun> = [
        {
            title: "Дата",
            dataIndex: "executedAt",
            key: "executedAt",
            width: 220,
            render: (value: string) => new Date(value).toLocaleString("ru-RU"),
        },
        {
            title: "Тест-кейс",
            key: "case",
            render: (_, run) => <Link to={`/cases/${run.caseId}`}>{run.caseTitle || `Case #${run.caseId}`}</Link>,
        },
        {
            title: "План",
            key: "plan",
            render: (_, run) => <Link to={`/plans/${run.planId}`}>{run.planName || `Plan #${run.planId}`}</Link>,
        },
        {
            title: "Статус",
            key: "status",
            width: 140,
            render: (_, run) => <Tag color={getRunStatusColor(run.statusSlug)}>{run.statusName}</Tag>,
        },
    ]

    const recentPlansColumns: ColumnsType<IDashboardRecentPlan> = [
        {
            title: "План",
            key: "name",
            render: (_, plan) => <Link to={`/plans/${plan.id}`}>{plan.name}</Link>,
        },
        {
            title: "Кейсов",
            dataIndex: "casesCount",
            key: "casesCount",
            width: 100,
        },
        {
            title: "Создан",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 220,
            render: (value: string) => new Date(value).toLocaleString("ru-RU"),
        },
    ]

    const trendMeta = trendLabelMap[data.totals.passRateTrend] ?? trendLabelMap.STABLE
    const trendChartData = data.trendLast7Days.map(point => ({
        day: new Date(point.date).toLocaleDateString("ru-RU", {day: "2-digit", month: "2-digit"}),
        passed: point.passedRuns,
        failed: point.failedRuns,
    }))

    return (
        <Space direction="vertical" size="large" style={{width: "100%"}}>
            <Card>
                <Space direction="vertical" size="small" style={{width: "100%"}}>
                    <Title level={2} style={{margin: 0}}>Дашборд качества</Title>
                    <Text type="secondary">Общий срез по тестам, планам и последним прогонам</Text>
                </Space>
            </Card>

            <Row gutter={[16, 16]}>
                <Col xs={24} md={8}><Card><Statistic title="Тест-кейсов" value={data.totals.totalCases}/></Card></Col>
                <Col xs={24} md={8}><Card><Statistic title="Тест-планов" value={data.totals.totalPlans}/></Card></Col>
                <Col xs={24} md={8}><Card><Statistic title="Всего прогонов" value={data.totals.totalRuns}/></Card></Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="Успешность прогонов">
                        <Space direction="vertical" size="middle" style={{width: "100%"}}>
                            <Progress percent={Math.round(data.totals.passRatePercent)} status={data.totals.passRatePercent >= 80 ? "success" : "active"}/>
                            <Text>
                                За 7 дней: <strong>{data.totals.passRateLast7DaysPercent.toFixed(2)}%</strong>,
                                было: <strong>{data.totals.passRatePrevious7DaysPercent.toFixed(2)}%</strong>
                            </Text>
                            <Text style={{color: trendMeta.color}}>
                                {trendMeta.icon} {trendMeta.label}
                            </Text>
                            <Space wrap>
                                <Tag color="success">Passed: {data.totals.passedRuns}</Tag>
                                <Tag color="error">Failed: {data.totals.failedRuns}</Tag>
                                <Tag color="volcano">Broken: {data.totals.brokenRuns}</Tag>
                                <Tag>Skipped: {data.totals.skippedRuns}</Tag>
                            </Space>
                        </Space>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card title="Последние тест-планы">
                        <Table<IDashboardRecentPlan>
                            rowKey="id"
                            columns={recentPlansColumns}
                            dataSource={data.recentPlans}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="Тренд за 7 дней">
                <div style={{width: "100%", height: 320}}>
                    <ResponsiveContainer>
                        <BarChart
                            data={trendChartData}
                            margin={{top: 8, right: 8, left: 0, bottom: 8}}
                        >
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="day"/>
                            <YAxis allowDecimals={false}/>
                            <Tooltip/>
                            <Legend/>
                            <Bar dataKey="failed" stackId="runs" fill="#cf1322" name="Failed"/>
                            <Bar dataKey="passed" stackId="runs" fill="#3f8600" name="Passed"/>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card title="Последние 10 прогонов">
                <Table<IDashboardRecentRun>
                    rowKey="id"
                    columns={recentRunsColumns}
                    dataSource={data.recentRuns}
                    pagination={false}
                />
            </Card>
        </Space>
    )
}

