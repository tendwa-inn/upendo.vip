import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Title, 
  Table, 
  TableHead, 
  TableRow, 
  TableHeaderCell, 
  TableBody, 
  TableCell, 
  Button,
  Tab,
  TabList,
  TabGroup,
  TabPanel,
  TabPanels,
  Badge,
  Text,
  Textarea,
  Dialog,
  DialogPanel
} from '@tremor/react';
import { reportService, UserAppeal, ReportedAccount, ReportedMessage } from '../services/reportService';
import { CheckCircle, XCircle, AlertTriangle, User, MessageSquare, Trash, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [userAppeals, setUserAppeals] = useState<UserAppeal[]>([]);
  const [reportedAccounts, setReportedAccounts] = useState<ReportedAccount[]>([]);
  const [reportedMessages, setReportedMessages] = useState<ReportedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppeal, setSelectedAppeal] = useState<UserAppeal | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportedAccount | null>(null);
  const [selectedMessageReport, setSelectedMessageReport] = useState<ReportedMessage | null>(null);
  const [appealNote, setAppealNote] = useState('');
  const [reportNote, setReportNote] = useState('');
  const [messageReportNote, setMessageReportNote] = useState('');
  const [suspendDuration, setSuspendDuration] = useState(7);

  useEffect(() => {
    loadAllReports();
  }, []);

  const loadAllReports = async () => {
    try {
      setLoading(true);
      console.log('Loading reports...');
      
      const [appeals, accounts, messages] = await Promise.all([
        reportService.getUserAppeals().catch(err => {
          console.error('Error loading appeals:', err);
          return [];
        }),
        reportService.getReportedAccounts().catch(err => {
          console.error('Error loading reported accounts:', err);
          return [];
        }),
        reportService.getReportedMessages().catch(err => {
          console.error('Error loading reported messages:', err);
          return [];
        }),
      ]);
      
      console.log('Loaded appeals:', appeals);
      console.log('Loaded accounts:', accounts);
      console.log('Loaded messages:', messages);
      
      setUserAppeals(appeals || []);
      setReportedAccounts(accounts || []);
      setReportedMessages(messages || []);
    } catch (error) {
      toast.error('Failed to load reports');
      console.error('Error loading reports:', error);
      
      // Set empty arrays as fallback
      setUserAppeals([]);
      setReportedAccounts([]);
      setReportedMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAppealDecision = async (appealId: string, approve: boolean) => {
    try {
      await reportService.processAppeal(appealId, approve, appealNote);
      toast.success(`Appeal ${approve ? 'approved' : 'denied'} successfully`);
      setSelectedAppeal(null);
      setAppealNote('');
      await loadAllReports();
    } catch (error) {
      toast.error('Failed to process appeal');
      console.error('Error processing appeal:', error);
    }
  };

  const handleReportedAccountAction = async (reportId: string, action: 'dismiss' | 'warn' | 'suspend' | 'ban') => {
    try {
      const duration = action === 'suspend' ? suspendDuration : undefined;
      await reportService.processReportedAccount(reportId, action, duration, reportNote);
      toast.success(`Report ${action}ed successfully`);
      setSelectedReport(null);
      setReportNote('');
      await loadAllReports();
    } catch (error) {
      toast.error('Failed to process report');
      console.error('Error processing report:', error);
    }
  };

  const handleReportedMessageAction = async (reportId: string, action: 'dismiss' | 'remove' | 'warn' | 'suspend') => {
    try {
      await reportService.processReportedMessage(reportId, action, messageReportNote);
      toast.success(`Message report ${action}ed successfully`);
      setSelectedMessageReport(null);
      setMessageReportNote('');
      await loadAllReports();
    } catch (error) {
      toast.error('Failed to process message report');
      console.error('Error processing message report:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'approved': return 'green';
      case 'denied': return 'red';
      case 'resolved': return 'green';
      case 'dismissed': return 'gray';
      case 'action_taken': return 'green';
      default: return 'gray';
    }
  };

  return (
    <div className="p-6">
            <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Reports & Appeals</h1>
        <Button onClick={loadAllReports} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
      
      <TabGroup defaultIndex={activeTab} onIndexChange={setActiveTab}>
        <TabList>
          <Tab>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>User Appeals ({userAppeals.length})</span>
            </div>
          </Tab>
          <Tab>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Reported Accounts ({reportedAccounts.length})</span>
            </div>
          </Tab>
          <Tab>
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Reported Messages ({reportedMessages.length})</span>
            </div>
          </Tab>
        </TabList>

        <TabPanels>
          {/* User Appeals Tab */}
          <TabPanel>
            <Card className="mt-6">
              <Title>User Appeals</Title>
              <Table className="mt-6">
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>User</TableHeaderCell>
                    <TableHeaderCell>Action Type</TableHeaderCell>
                    <TableHeaderCell>Original Reason</TableHeaderCell>
                    <TableHeaderCell>Appeal Reason</TableHeaderCell>
                    <TableHeaderCell>Created</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userAppeals.map((appeal) => (
                    <TableRow key={appeal.id}>
                      <TableCell>{appeal.userName || 'Unknown User'}</TableCell>
                      <TableCell>
                        <Badge color={appeal.actionType === 'ban' ? 'red' : appeal.actionType === 'suspension' ? 'orange' : 'yellow'}>
                          {(appeal.actionType || 'unknown').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{appeal.reason || 'No reason provided'}</TableCell>
                      <TableCell>
                        <Text className="max-w-xs truncate">{appeal.appealReason || 'No appeal reason provided'}</Text>
                      </TableCell>
                      <TableCell>{appeal.createdAt ? new Date(appeal.createdAt).toLocaleDateString() : "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            onClick={() => setSelectedAppeal(appeal)}
                            size="xs"
                            icon={Eye}
                          >
                            Review
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {userAppeals.length === 0 && (
                <div className="text-center py-8 text-gray-500">No pending appeals</div>
              )}
            </Card>
          </TabPanel>

          {/* Reported Accounts Tab */}
          <TabPanel>
            <Card className="mt-6">
              <Title>Reported Accounts</Title>
              <Table className="mt-6">
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Reported User</TableHeaderCell>
                    <TableHeaderCell>Reported By</TableHeaderCell>
                    <TableHeaderCell>Reason</TableHeaderCell>
                    <TableHeaderCell>Priority</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Created</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportedAccounts.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.reportedUserName || 'Unknown User'}</TableCell>
                      <TableCell>{report.reportedByName || 'Unknown Reporter'}</TableCell>
                      <TableCell>
                        <Badge color="red">{(report.reason || 'unknown').replace('_', ' ').toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge color={getPriorityColor(report.priority || 'medium')}>
                          {(report.priority || 'medium').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge color={getStatusColor(report.status || 'pending')}>
                          {(report.status || 'pending').replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            onClick={() => setSelectedReport(report)}
                            size="xs"
                            icon={Eye}
                          >
                            Review
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {reportedAccounts.length === 0 && (
                <div className="text-center py-8 text-gray-500">No reported accounts</div>
              )}
            </Card>
          </TabPanel>

          {/* Reported Messages Tab */}
          <TabPanel>
            <Card className="mt-6">
              <Title>Reported Messages</Title>
              <Table className="mt-6">
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Sender</TableHeaderCell>
                    <TableHeaderCell>Reported By</TableHeaderCell>
                    <TableHeaderCell>Message Content</TableHeaderCell>
                    <TableHeaderCell>Reason</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Created</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportedMessages.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.senderName || 'Unknown Sender'}</TableCell>
                      <TableCell>{report.reportedByName || 'Unknown Reporter'}</TableCell>
                      <TableCell>
                        <Text className="max-w-xs truncate">{report.content || 'No content available'}</Text>
                      </TableCell>
                      <TableCell>
                        <Badge color="red">{report.reason || 'unknown'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge color={getStatusColor(report.status || 'pending')}>
                          {(report.status || 'pending').replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            onClick={() => setSelectedMessageReport(report)}
                            size="xs"
                            icon={Eye}
                          >
                            Review
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {reportedMessages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No reported messages
                </div>
              )}
            </Card>
          </TabPanel>
        </TabPanels>
      </TabGroup>

      {/* Appeal Review Dialog */}
      <Dialog open={!!selectedAppeal} onClose={() => setSelectedAppeal(null)}>
        <DialogPanel>
          <Title>Review Appeal</Title>
          {selectedAppeal && (
            <div className="mt-4 space-y-4">
              <div>
                <Text className="font-semibold">User:</Text>
                <Text>{selectedAppeal.userName || 'Unknown User'}</Text>
              </div>
              <div>
                <Text className="font-semibold">Action Type:</Text>
                <Badge color={selectedAppeal.actionType === 'ban' ? 'red' : 'orange'}>
                  {(selectedAppeal.actionType || 'unknown').toUpperCase()}
                </Badge>
              </div>
              <div>
                <Text className="font-semibold">Original Reason:</Text>
                <Text>{selectedAppeal.reason || 'No reason provided'}</Text>
              </div>
              <div>
                <Text className="font-semibold">Appeal Reason:</Text>
                <Text>{selectedAppeal.appealReason || 'No appeal reason provided'}</Text>
              </div>
              {selectedAppeal.expiresAt && (
                <div>
                  <Text className="font-semibold">Expires At:</Text>
                  <Text>{selectedAppeal.expiresAt ? new Date(selectedAppeal.expiresAt).toLocaleDateString() : "N/A"}</Text>
                </div>
              )}
              <div>
                <Text className="font-semibold">Admin Note:</Text>
                <Textarea
                  value={appealNote}
                  onChange={(e) => setAppealNote(e.target.value)}
                  placeholder="Add your decision notes here..."
                  rows={3}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={() => handleAppealDecision(selectedAppeal.id, true)}
                  icon={CheckCircle}
                  color="green"
                >
                  Approve Appeal
                </Button>
                <Button
                  onClick={() => handleAppealDecision(selectedAppeal.id, false)}
                  icon={XCircle}
                  color="red"
                >
                  Deny Appeal
                </Button>
                <Button
                  onClick={() => setSelectedAppeal(null)}
                  variant="secondary"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogPanel>
      </Dialog>

      {/* Reported Account Review Dialog */}
      <Dialog open={!!selectedReport} onClose={() => setSelectedReport(null)}>
        <DialogPanel>
          <Title>Review Reported Account</Title>
          {selectedReport && (
            <div className="mt-4 space-y-4">
              <div className="p-3 border rounded-md bg-gray-50 dark:bg-gray-900">
                <Text className="font-semibold text-gray-600 dark:text-gray-400">Reported User:</Text>
                <Text className="text-lg font-medium text-gray-900 dark:text-gray-100">{selectedReport.reportedUserName || 'Unknown User'}</Text>
              </div>
              <div className="p-3 border rounded-md bg-gray-50 dark:bg-gray-900">
                <Text className="font-semibold text-gray-600 dark:text-gray-400">Reported By:</Text>
                <Text className="text-lg font-medium text-gray-900 dark:text-gray-100">{selectedReport.reportedByName || 'Unknown Reporter'}</Text>
              </div>
              <div className="p-3 border rounded-md bg-gray-50 dark:bg-gray-900">
                <Text className="font-semibold text-gray-600 dark:text-gray-400">Reason:</Text>
                <Badge color="red">{(selectedReport.reason || 'unknown').replace('_', ' ').toUpperCase()}</Badge>
              </div>
              <div className="p-3 border rounded-md bg-gray-50 dark:bg-gray-900">
                <Text className="font-semibold text-gray-600 dark:text-gray-400">Priority:</Text>
                <Badge color={getPriorityColor(selectedReport.priority || 'medium')}>
                  {(selectedReport.priority || 'medium').toUpperCase()}
                </Badge>
              </div>
              <div className="p-3 border rounded-md bg-gray-50 dark:bg-gray-900">
                <Text className="font-semibold text-gray-600 dark:text-gray-400">Description:</Text>
                <Text className="text-gray-800 dark:text-gray-200">{selectedReport.description || 'No description provided'}</Text>
              </div>
              <div className="p-3 border rounded-md bg-gray-50 dark:bg-gray-900">
                <Text className="font-semibold text-gray-600 dark:text-gray-400">Admin Note:</Text>
                <Textarea
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                  placeholder="Add your decision notes here..."
                  rows={3}
                />
              </div>
              {selectedReport.priority === 'high' || selectedReport.priority === 'urgent' ? (
                <div className="p-3 border rounded-md bg-yellow-50 dark:bg-yellow-900/20">
                  <Text className="font-semibold text-yellow-800 dark:text-yellow-200">Suspension Duration (days):</Text>
                  <input
                    type="number"
                    value={suspendDuration}
                    onChange={(e) => setSuspendDuration(parseInt(e.target.value) || 7)}
                    min="1"
                    max="365"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              ) : null}
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={() => handleReportedAccountAction(selectedReport.id, 'dismiss')}
                  variant="secondary"
                >
                  Dismiss Report
                </Button>
                <Button
                  onClick={() => handleReportedAccountAction(selectedReport.id, 'warn')}
                  icon={AlertTriangle}
                  color="yellow"
                >
                  Issue Warning
                </Button>
                <Button
                  onClick={() => handleReportedAccountAction(selectedReport.id, 'suspend')}
                  icon={User}
                  color="orange"
                >
                  Suspend Account
                </Button>
                <Button
                  onClick={() => handleReportedAccountAction(selectedReport.id, 'ban')}
                  icon={XCircle}
                  color="red"
                >
                  Permanent Ban
                </Button>
                <Button
                  onClick={() => setSelectedReport(null)}
                  variant="light"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogPanel>
      </Dialog>

      {/* Reported Message Review Dialog */}
      <Dialog open={!!selectedMessageReport} onClose={() => setSelectedMessageReport(null)}>
        <DialogPanel>
          <Title>Review Reported Message</Title>
          {selectedMessageReport && (
            <div className="mt-4 space-y-4">
              <div>
                <Text className="font-semibold">Sender:</Text>
                <Text>{selectedMessageReport.senderName || 'Unknown Sender'}</Text>
              </div>
              <div>
                <Text className="font-semibold">Reported By:</Text>
                <Text>{selectedMessageReport.reportedByName || 'Unknown Reporter'}</Text>
              </div>
              <div>
                <Text className="font-semibold">Message Content:</Text>
                <div className="mt-2 p-3 bg-gray-100 rounded-md border">
                  <Text>{selectedMessageReport.content || 'No content available'}</Text>
                </div>
              </div>
              <div>
                <Text className="font-semibold">Reason:</Text>
                <Badge color="red">{selectedMessageReport.reason || 'unknown'}</Badge>
              </div>
              <div>
                <Text className="font-semibold">Admin Note:</Text>
                <Textarea
                  value={messageReportNote}
                  onChange={(e) => setMessageReportNote(e.target.value)}
                  placeholder="Add your decision notes here..."
                  rows={3}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={() => handleReportedMessageAction(selectedMessageReport.id, 'dismiss')}
                  variant="secondary"
                >
                  Dismiss Report
                </Button>
                <Button
                  onClick={() => handleReportedMessageAction(selectedMessageReport.id, 'remove')}
                  icon={Trash}
                  color="red"
                >
                  Remove Message
                </Button>
                <Button
                  onClick={() => handleReportedMessageAction(selectedMessageReport.id, 'warn')}
                  icon={AlertTriangle}
                  color="yellow"
                >
                  Warn Sender
                </Button>
                <Button
                  onClick={() => handleReportedMessageAction(selectedMessageReport.id, 'suspend')}
                  icon={User}
                  color="orange"
                >
                  Suspend Sender
                </Button>
                <Button
                  onClick={() => setSelectedMessageReport(null)}
                  variant="light"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogPanel>
      </Dialog>
    </div>
  );
};

export default AdminReportsPage;