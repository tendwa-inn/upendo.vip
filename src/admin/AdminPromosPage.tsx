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
  Dialog,
  DialogPanel,
  Select,
  SelectItem,
  TextInput,
  NumberInput
} from '@tremor/react';
import { promoService } from '../services/promoService';
import { PromoCode } from '../types/admin';
import { PlusCircleIcon, CheckCircleIcon, XCircleIcon, InformationCircleIcon, TrashIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import Portal from '../components/Portal';
import Tooltip from '../components/Tooltip';
import ConfirmationModal from '../components/modals/ConfirmationModal';

const AdminPromosPage: React.FC = () => {
  const [activePromos, setActivePromos] = useState<PromoCode[]>([]);
  const [expiredPromos, setExpiredPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; promo: PromoCode | null }>({ isOpen: false, promo: null });
  const [newPromo, setNewPromo] = useState<Partial<PromoCode>>({
    type: 'message_requests',
    durationDays: null,
  });

  useEffect(() => {
    loadPromos();
  }, []);

  const loadPromos = async () => {
    try {
      setLoading(true);
      const { active, expired } = await promoService.getPromoCodes();
      setActivePromos(active);
      setExpiredPromos(expired);
    } catch (error) {
      toast.error('Failed to load promo codes');
      console.error('Error loading promos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromo = async () => {
    try {
      if (!newPromo.code) {
        newPromo.code = generateRandomCode();
      }
      const promoToCreate = { ...newPromo, durationDays: newPromo.durationDays || 30 }; // Add default value

      await promoService.createPromoCode(promoToCreate);
      toast.success('Promo code created successfully');
      setIsDialogOpen(false);
      setNewPromo({ type: 'message_requests', maxUses: 100, durationDays: null });
      loadPromos();
    } catch (error) {
      toast.error('Failed to create promo code');
      console.error('Error creating promo:', error);
    }
  };

  const generateRandomCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleInputChange = (key: keyof PromoCode, value: any) => {
    setNewPromo(prev => ({ ...prev, [key]: value }));
  };



  const handleDeleteClick = (promo: PromoCode) => {
    setDeleteModal({ isOpen: true, promo });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.promo) return;

    try {
      await promoService.deletePromoCode(deleteModal.promo.id);
      toast.success('Promo code deleted successfully. Users have been reverted.');
      setDeleteModal({ isOpen: false, promo: null });
      loadPromos();
    } catch (error) {
      toast.error('Failed to delete promo code');
      console.error('Error deleting promo:', error);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, promo: null });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2b0f16] to-[#120508] text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Promo Code Management</h1>
        <Button icon={PlusCircleIcon} onClick={() => setIsDialogOpen(true)}>Add Promo Code</Button>
      </div>
      
      <TabGroup>
        <TabList>
          <Tab>Active Promos ({activePromos.length})</Tab>
          <Tab>Expired Promos ({expiredPromos.length})</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Card className="mt-6">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Code</TableHeaderCell>
                    <TableHeaderCell>Type</TableHeaderCell>
                    <TableHeaderCell>Uses (Used/Max)</TableHeaderCell>
                    <TableHeaderCell>Expires At</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activePromos.map(promo => (
                    <TableRow key={promo.id}>
                      <TableCell><Badge color="blue">{promo.code}</Badge></TableCell>
                      <TableCell>{promo.type.replace('_', ' ')}</TableCell>
                      <TableCell>{promo.timesUsed} / {promo.maxUses ?? '∞'}</TableCell>
                      <TableCell>{promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString() : 'No expiry'}</TableCell>
                      <TableCell>
                        <Button
                          size="xs"
                          variant="light"
                          color="red"
                          icon={TrashIcon}
                          onClick={() => handleDeleteClick(promo)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabPanel>
          <TabPanel>
            <Card className="mt-6">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Code</TableHeaderCell>
                    <TableHeaderCell>Type</TableHeaderCell>
                    <TableHeaderCell>Uses (Used/Max)</TableHeaderCell>
                    <TableHeaderCell>Expired At</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expiredPromos.map(promo => (
                    <TableRow key={promo.id}>
                      <TableCell><Badge>{promo.code}</Badge></TableCell>
                      <TableCell>{promo.type.replace('_', ' ')}</TableCell>
                      <TableCell>{promo.timesUsed} / {promo.maxUses ?? '∞'}</TableCell>
                      <TableCell>{promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString() : 'No expiry'}</TableCell>
                      <TableCell>
                        <Button
                          size="xs"
                          variant="light"
                          color="red"
                          icon={TrashIcon}
                          onClick={() => handleDeleteClick(promo)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabPanel>
        </TabPanels>
      </TabGroup>

      {isDialogOpen && (
        <Portal>
          <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} static={true}>
            <DialogPanel className="bg-[#3a1a22] p-6 rounded-lg shadow-xl z-50 text-white">
              <Title className="mb-4 text-white">Add New Promo Code</Title>
              <div className="space-y-4">
                <TextInput 
                  placeholder="Promo Code Name"
                  onValueChange={(value) => handleInputChange('name', value)}
                />
                <TextInput 
                  placeholder="Description"
                  onValueChange={(value) => handleInputChange('description', value)}
                />
                <div className="flex items-center space-x-2">
                  <TextInput 
                    placeholder="Enter code or leave blank to generate"
                    value={newPromo.code || ''}
                    onValueChange={(value) => handleInputChange('code', value)}
                  />
                  <Button onClick={() => handleInputChange('code', generateRandomCode())}>Generate</Button>
                </div>
                <div className="relative">
                  <select 
                    className="w-full appearance-none bg-[#3a1a22] border border-white/20 rounded-md py-2 px-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    value={newPromo.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                  >
                    <option value="message_requests">Message Requests</option>
                    <option value="popularity_boost">Popularity Boost</option>
                    <option value="pro_account">Pro Account</option>
                    <option value="vip_account">VIP Account</option>
                    <option value="unlimited_swipes">Unlimited Swipes</option>
                    <option value="limited_swipes">Limited Swipes (20-100)</option>
                    <option value="profile_views">Profile Views (Days)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>


                <div className="relative">
                  <select
                    className="w-full appearance-none bg-[#3a1a22] border border-white/20 rounded-md py-2 px-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    value={newPromo.durationDays || ''}
                    onChange={(e) => handleInputChange('durationDays', parseInt(e.target.value))}
                  >
                    <option value="">Select Expiry Duration</option>
                    <option value="0.0417">1 Hour</option>
                    <option value="1">1 Day</option>
                    <option value="7">1 Week</option>
                    <option value="14">2 Weeks</option>
                    <option value="30">1 Month</option>
                    <option value="365">1 Year</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                  <Tooltip content="When this promo code expires (1 hour, 1 day, 1 week, etc.)">
                  <InformationCircleIcon className="h-5 w-5 text-white/60 absolute right-10 top-2" />
                </Tooltip>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <Button icon={XCircleIcon} variant="secondary" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button icon={CheckCircleIcon} onClick={handleCreatePromo}>Create Promo Code</Button>
              </div>
            </DialogPanel>
          </Dialog>
        </Portal>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Promo Code"
        message={`Are you sure you want to delete promo code ${deleteModal.promo?.code}? This will permanently remove this promo code and revert all users who are currently using it back to their normal accounts.`}
        confirmText="Delete Promo Code"
        type="danger"
      />
    </div>
  );
};

export default AdminPromosPage;
