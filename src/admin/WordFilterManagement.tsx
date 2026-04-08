
import React, { useState, useEffect } from 'react';
import { Card, Title, Text, Metric, Col, Grid, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Badge, Button } from '@tremor/react';
import { Filter, User, AlertTriangle } from 'lucide-react';
import { wordFilterService } from '../services/wordFilterService';
import toast from 'react-hot-toast';

const WordFilterManagement: React.FC = () => {
  const [filteredWords, setFilteredWords] = useState<Array<{id: number, word: string, created_at: string, word_actions: any[]}>>([]);
  const [flaggedUsers, setFlaggedUsers] = useState<Array<any>>([]);
  const [newWord, setNewWord] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [selectedAction, setSelectedAction] = useState<'warning' | 'suspension' | 'ban'>('warning');
  const [suspensionDays, setSuspensionDays] = useState<number>(7);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [words, flagged] = await Promise.all([
        wordFilterService.getFilteredWords(),
        wordFilterService.getFlaggedContent()
      ]);
      setFilteredWords(words || []);
      setFlaggedUsers(flagged || []);
    } catch (error) {
      toast.error('Failed to load data');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openSetActionModal = (word: any) => {
    setSelectedWord(word);
    if (word.word_actions && word.word_actions.length > 0) {
      setSelectedAction(word.word_actions[0].action_type);
      if (word.word_actions[0].duration_days) {
        setSuspensionDays(word.word_actions[0].duration_days);
      }
    } else {
      setSelectedAction('warning');
      setSuspensionDays(7);
    }
    setIsModalOpen(true);
  };

  const handleSetAction = async () => {
    if (!selectedWord) return;

    try {
      await wordFilterService.setWordAction(
        selectedWord.id,
        selectedAction,
        selectedAction === 'suspension' ? suspensionDays : null
      );
      toast.success('Automatic action set successfully');
      await loadData();
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to set automatic action');
      console.error('Error setting action:', error);
    }
  };

  const handleAddWord = async () => {
    if (newWord && !filteredWords.some(w => w.word === newWord)) {
      try {
        await wordFilterService.addFilteredWord(newWord);
        await loadData();
        setNewWord('');
        toast.success('Word added to filter');
      } catch (error) {
        toast.error('Failed to add word');
        console.error('Error adding word:', error);
      }
    }
  };

  const handleRemoveWord = async (id: number) => {
    try {
      await wordFilterService.removeFilteredWord(id);
      await loadData();
      toast.success('Word removed from filter');
    } catch (error) {
      toast.error('Failed to remove word');
      console.error('Error removing word:', error);
    }
  };

  const handleUserAction = async (userId: string, actionType: 'warning' | 'suspension' | 'ban', reason?: string, flaggedWord?: string) => {
    try {
      let expiresAt: string | undefined;
      let suspensionDays: number | null = null;

      if (actionType === 'suspension') {
        const days = prompt('Enter suspension duration in days (e.g., 1, 7). Leave empty for indefinite suspension:', '7');
        if (days) {
          suspensionDays = parseInt(days);
          expiresAt = new Date(Date.now() + suspensionDays * 24 * 60 * 60 * 1000).toISOString();
        } else {
          // Indefinite suspension
          expiresAt = undefined;
        }
      }

      const fullReason = actionType === 'warning' 
        ? `You have been warned for using the word "${flaggedWord}". Such words do not uphold the integrity of the app. Please refrain from using this word in future.`
        : reason;

      await wordFilterService.takeUserAction(userId, actionType, fullReason, expiresAt);

      if (actionType === 'warning') {
        toast.success(fullReason, { duration: 6000 });
      } else {
        toast.success(`User has been suspended for ${suspensionDays ? `${suspensionDays} days` : 'indefinitely'}. They can appeal this decision.`);
      }
      
      await loadData();
    } catch (error) {
      toast.error(`Failed to apply ${actionType}`);
      console.error(`Error applying ${actionType}:`, error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Word Filter Management</h1>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : (
        <Grid numItemsLg={2} className="gap-6">
          <Col>
            <Card>
              <Title>Filtered Words</Title>
              <div className="flex mt-4">
                <input
                  type="text"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  className="flex-grow p-2 border rounded-l-md bg-gray-800 text-white"
                  placeholder="Add a new word to filter"
                />
                <Button onClick={handleAddWord} className="rounded-l-none">Add Word</Button>
              </div>
              <Table className="mt-6">
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Word</TableHeaderCell>
                    <TableHeaderCell>Automatic Action</TableHeaderCell>
                    <TableHeaderCell>Action</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredWords.map((word) => (
                    <TableRow key={word.id}>
                      <TableCell>{word.word}</TableCell>
                      <TableCell>
                        {word.word_actions && word.word_actions.length > 0
                          ? `${word.word_actions[0].action_type}${word.word_actions[0].duration_days ? ` (${word.word_actions[0].duration_days} days)` : ''}`
                          : 'None'}
                      </TableCell>
                      <TableCell>
                        <Button onClick={() => openSetActionModal(word)} size="xs" variant="secondary">Set Action</Button>
                        <Button onClick={() => handleRemoveWord(word.id)} size="xs" variant="secondary" color="red">Remove</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </Col>

          <Col>
            <Card>
              <Title>Flagged Users</Title>
              <Table className="mt-6">
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>User</TableHeaderCell>
                    <TableHeaderCell>Flagged Content</TableHeaderCell>
                    <TableHeaderCell>Word</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {flaggedUsers.map((flagged) => (
                    <TableRow key={flagged.id}>
                      <TableCell>{flagged.user?.name || 'Unknown User'}</TableCell>
                      <TableCell className="max-w-xs truncate">{flagged.content}</TableCell>
                      <TableCell>
                        <Badge color="red" icon={AlertTriangle}>{flagged.word?.word}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button onClick={() => handleUserAction(flagged.user_id, 'warning', undefined, flagged.word?.word)} size="xs">Warn</Button>
                          <Button onClick={() => handleUserAction(flagged.user_id, 'suspension', 'Repeated inappropriate content', flagged.word?.word)} size="xs">Suspend</Button>
                          <Button onClick={() => handleUserAction(flagged.user_id, 'ban', 'Severe violation', flagged.word?.word)} size="xs" color="red">Ban</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </Col>
        </Grid>
      )}

      {isModalOpen && selectedWord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Card className="max-w-md">
            <Title>Set Automatic Action for "{selectedWord.word}"</Title>
            <div className="mt-6">
              <label htmlFor="actionType" className="block text-sm font-medium text-gray-300">Action Type</label>
              <select
                id="actionType"
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value as any)}
                className="mt-1 block w-full p-2 border rounded-md bg-gray-800 text-white"
              >
                <option value="warning">Warning</option>
                <option value="suspension">Suspension</option>
                <option value="ban">Ban</option>
              </select>
            </div>
            {selectedAction === 'suspension' && (
              <div className="mt-4">
                <label htmlFor="suspensionDays" className="block text-sm font-medium text-gray-300">Suspension Duration (days)</label>
                <input
                  id="suspensionDays"
                  type="number"
                  value={suspensionDays}
                  onChange={(e) => setSuspensionDays(parseInt(e.target.value))}
                  className="mt-1 block w-full p-2 border rounded-md bg-gray-800 text-white"
                />
              </div>
            )}
            <div className="mt-6 flex justify-end space-x-2">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSetAction}>Set Action</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WordFilterManagement;
