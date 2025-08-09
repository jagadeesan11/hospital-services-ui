import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, TextField, FormControl, InputLabel,
  Select, MenuItem, Chip, IconButton, Tooltip, CircularProgress,
  TablePagination
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PaymentIcon from '@mui/icons-material/Payment';
import SearchIcon from '@mui/icons-material/Search';
import { Bill, BillStatus, billingService } from '../../services/billingService';
import { hospitalService } from '../../services/hospitalService';
import BillDetailsDialog from './BillDetailsDialog';
import AddPaymentDialog from './AddPaymentDialog';
import CreateBillDialog from './CreateBillDialog';

const BillingList: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [bills, setBills] = useState<Bill[]>([]);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedHospital, setSelectedHospital] = useState<number | string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Add hospitals state
  const [hospitals, setHospitals] = useState<{ id: number, name: string }[]>([]);
  const [hospitalsLoading, setHospitalsLoading] = useState<boolean>(true);

  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState<boolean>(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState<boolean>(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  useEffect(() => {
    // Don't fetch bills on initial mount - wait for hospital selection
    // fetchBills();
  }, []);

  useEffect(() => {
    fetchBills();
  }, [selectedHospital]);

  useEffect(() => {
    filterBills();
  }, [searchTerm, statusFilter, selectedHospital, bills, startDate, endDate]);

  // New effect to fetch hospitals
  useEffect(() => {
    const fetchHospitals = async () => {
      setHospitalsLoading(true);
      try {
        const response = await hospitalService.getAllHospitals();
        setHospitals(response.data);
      } catch (error) {
        console.error('Error fetching hospitals:', error);
        setHospitals([]);
      } finally {
        setHospitalsLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    try {
      // If no hospital is selected, we can't fetch bills since getHospitalBills requires hospitalId
      if (!selectedHospital || selectedHospital === '') {
        setBills([]);
        setFilteredBills([]);
        setLoading(false);
        return;
      }

      console.log('Fetching bills for hospital:', selectedHospital);
      const response = await billingService.getHospitalBills(selectedHospital as number);
      console.log('Bills response:', response);
      console.log('Bills data:', response.data);
      console.log('Bills array length:', response.data ? response.data.length : 'No data');

      // Check if bills contain any patient-related fields
      if (response.data && response.data.length > 0) {
        console.log('First bill structure:', response.data[0]);
        console.log('Bill keys:', Object.keys(response.data[0]));
        console.log('Looking for patient fields in bill:', {
          patientId: response.data[0].patientId,
          patientName: response.data[0].patientName,
          patient: response.data[0].patient
        });
      }

      setBills(response.data || []);
      setFilteredBills(response.data || []);
    } catch (error) {
      console.error('Error fetching bills:', error);
      setBills([]);
      setFilteredBills([]);
    } finally {
      setLoading(false);
    }
  };

  const filterBills = () => {
    let filtered = [...bills];
    console.log('Original bills:', bills.length);
    console.log('Bills data:', bills);

    if (searchTerm) {
      console.log('Filtering by search term:', searchTerm);
      filtered = filtered.filter(bill => {
        const patientName = bill.patient
          ? `${bill.patient.firstName} ${bill.patient.lastName}`.toLowerCase()
          : bill.patientName?.toLowerCase() || '';

        return bill.billNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               patientName.includes(searchTerm.toLowerCase());
      });
      console.log('After search filter:', filtered.length);
    }

    if (statusFilter) {
      console.log('Filtering by status:', statusFilter);
      filtered = filtered.filter(bill => bill.status === statusFilter);
      console.log('After status filter:', filtered.length);
    }

    // Filter by date range if both start and end dates are provided
    if (startDate && endDate) {
      console.log('Filtering by date range:', { startDate, endDate });
      filtered = filtered.filter(bill => {
        const billDate = new Date(bill.billDate);
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Include bills where the bill date is between the start and end dates
        return billDate >= start && billDate <= end;
      });
      console.log('After date range filter:', filtered.length);
    }

    console.log('Final filtered bills count:', filtered.length);
    setFilteredBills(filtered);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (bill: Bill) => {
    setSelectedBill(bill);
    setDetailsDialogOpen(true);
  };

  const handleAddPayment = (bill: Bill) => {
    setSelectedBill(bill);
    setPaymentDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    fetchBills();
  };

  const handlePaymentSuccess = () => {
    setPaymentDialogOpen(false);
    fetchBills();
  };

  const getStatusColor = (status: BillStatus) => {
    switch (status) {
      case BillStatus.PAID:
        return 'success';
      case BillStatus.PARTIALLY_PAID:
        return 'warning';
      case BillStatus.OVERDUE:
        return 'error';
      case BillStatus.CANCELLED:
        return 'error';
      default:
        return 'info';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" component="h1">Billing Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Bill
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            label="Search Bills"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
            }}
            sx={{ flexGrow: 1, minWidth: '200px' }}
          />

          <FormControl size="small" sx={{ minWidth: '150px' }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All Status</MenuItem>
              {Object.values(BillStatus).map((status) => (
                <MenuItem key={status} value={status}>{status.replace(/_/g, ' ')}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Hospital filter would be populated from available hospitals */}
          <FormControl size="small" sx={{ minWidth: '150px' }}>
            <InputLabel>Hospital</InputLabel>
            <Select
              value={selectedHospital}
              label="Hospital"
              onChange={(e) => setSelectedHospital(e.target.value)}
            >
              <MenuItem value="">All Hospitals</MenuItem>
              {hospitalsLoading ? (
                <MenuItem disabled>
                  <CircularProgress size={24} />
                </MenuItem>
              ) : hospitals.length > 0 ? (
                hospitals.map((hospital) => (
                  <MenuItem key={hospital.id} value={hospital.id}>{hospital.name}</MenuItem>
                ))
              ) : (
                <MenuItem disabled>No hospitals found</MenuItem>
              )}
            </Select>
          </FormControl>

          {/* Date range filters */}
          <TextField
            label="Start Date"
            type="date"
            variant="outlined"
            size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ minWidth: '150px' }}
          />

          <TextField
            label="End Date"
            type="date"
            variant="outlined"
            size="small"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ minWidth: '150px' }}
          />
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="billing table">
          <TableHead>
            <TableRow>
              <TableCell>Bill Number</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell align="right">Total Amount</TableCell>
              <TableCell align="right">Paid Amount</TableCell>
              <TableCell align="right">Balance</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredBills.length > 0 ? (
              (rowsPerPage > 0
                ? filteredBills.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : filteredBills
              ).map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell>{bill.billNumber}</TableCell>
                  <TableCell>
                    {bill.patient 
                      ? `${bill.patient.firstName} ${bill.patient.lastName}` 
                      : bill.patientName || 'N/A'
                    }
                  </TableCell>
                  <TableCell>{formatDate(bill.billDate)}</TableCell>
                  <TableCell>{formatDate(bill.dueDate)}</TableCell>
                  <TableCell align="right">{formatCurrency(bill.totalAmount)}</TableCell>
                  <TableCell align="right">{formatCurrency(bill.paidAmount)}</TableCell>
                  <TableCell align="right">{formatCurrency(bill.balanceAmount)}</TableCell>
                  <TableCell>
                    <Chip
                      label={bill.status.replace(/_/g, ' ')}
                      color={getStatusColor(bill.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewDetails(bill)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {bill.status !== BillStatus.PAID && bill.status !== BillStatus.CANCELLED && (
                        <Tooltip title="Add Payment">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleAddPayment(bill)}
                          >
                            <PaymentIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No bills found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
          component="div"
          count={filteredBills.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Create Bill Dialog */}
      <CreateBillDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Bill Details Dialog */}
      <BillDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        bill={selectedBill}
        onStatusChange={fetchBills}
      />

      {/* Add Payment Dialog */}
      <AddPaymentDialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        onSuccess={handlePaymentSuccess}
        bill={selectedBill}
      />
    </Box>
  );
};

export default BillingList;
