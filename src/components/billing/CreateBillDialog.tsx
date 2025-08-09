import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormControl, InputLabel, Select,
  MenuItem, FormHelperText, IconButton, Typography,
  Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Divider, CircularProgress,
  List, ListItem, ListItemText, Autocomplete, Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import { Bill, BillItemDTO, BillStatus, billingService } from '../../services/billingService';
import { ServiceCatalogDTO, serviceCatalogService } from '../../services/serviceCatalogService';
import { Patient, patientService } from '../../services/patientService';
import { MedicalRecord, medicalRecordService } from '../../services/medicalRecordService';
import { hospitalService } from '../../services/hospitalService';

interface CreateBillDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateBillDialog: React.FC<CreateBillDialogProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const initialBillState: Partial<Bill> = {
    patientId: 0,
    hospitalId: 0,
    billDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    status: BillStatus.PENDING,
    billItems: [],
    payments: [],
    subtotal: 0,
    tax: 0,
    totalAmount: 0,
    paidAmount: 0,
    balanceDue: 0,
    notes: ''
  };

  // Form state
  const [bill, setBill] = useState<Partial<Bill>>(initialBillState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [serviceSearch, setServiceSearch] = useState<string>('');

  // Data for dropdowns and selections
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientDetails, setPatientDetails] = useState<Patient | null>(null);
  const [hospitals, setHospitals] = useState<{ id: number, name: string }[]>([]);
  const [services, setServices] = useState<ServiceCatalogDTO[]>([]);
  const [filteredServices, setFilteredServices] = useState<ServiceCatalogDTO[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceCatalogDTO | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  // Patient medical history
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState<boolean>(false);
  const [showMedicalHistory, setShowMedicalHistory] = useState<boolean>(false);

  // Loading states
  const [isLoadingPatients, setIsLoadingPatients] = useState<boolean>(false);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState<boolean>(false);
  const [isLoadingServices, setIsLoadingServices] = useState<boolean>(false);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setBill(initialBillState);
      setErrors({});
      setServiceSearch('');
      setSelectedService(null);
      setQuantity(1);

      // Fetch data for dropdowns
      loadPatients();
      loadHospitals();
      loadServices();
    }
  }, [open]);

  // Filter services when search changes
  useEffect(() => {
    if (serviceSearch) {
      const filtered = services.filter(service =>
        service.serviceName.toLowerCase().includes(serviceSearch.toLowerCase()) ||
        service.serviceCode.toLowerCase().includes(serviceSearch.toLowerCase())
      );
      setFilteredServices(filtered);
    } else {
      setFilteredServices([]);
    }
  }, [serviceSearch, services]);

  // Calculate totals when items change
  useEffect(() => {
    if (bill.billItems && bill.billItems.length > 0) {
      const subtotal = bill.billItems.reduce((sum, item) => sum + (item.totalAmount || item.total || 0), 0);
      const tax = bill.billItems.reduce((sum, item) => sum + (item.taxAmount || item.tax || 0), 0);

      setBill(prev => ({
        ...prev,
        subTotal: subtotal,
        taxAmount: tax,
        totalAmount: subtotal + tax,
        balanceAmount: subtotal + tax
      }));
    } else {
      setBill(prev => ({
        ...prev,
        subTotal: 0,
        taxAmount: 0,
        totalAmount: 0,
        balanceAmount: 0
      }));
    }
  }, [bill.billItems]);

  // Mock functions for loading dropdown data
  const loadPatients = async () => {
    setIsLoadingPatients(true);
    try {
      const response = await patientService.getAllPatients();
      setPatients(response.data);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setIsLoadingPatients(false);
    }
  };

  const loadHospitals = async () => {
    setIsLoadingHospitals(true);
    try {
      const response = await hospitalService.getAllHospitals();
      setHospitals(response.data);
    } catch (error) {
      console.error('Error loading hospitals:', error);
    } finally {
      setIsLoadingHospitals(false);
    }
  };

  const loadServices = async () => {
    setIsLoadingServices(true);
    try {
      // Only load services if a hospital is selected
      if (bill.hospitalId && bill.hospitalId !== 0) {
        const response = await serviceCatalogService.getServicesByHospital(bill.hospitalId);
        setServices(response.data);
      } else {
        setServices([]);
      }
    } catch (error) {
      console.error('Error loading services:', error);
      setServices([]);
    } finally {
      setIsLoadingServices(false);
    }
  };

  // New function to load services when hospital changes
  const loadServicesByHospital = async (hospitalId: number) => {
    if (!hospitalId || hospitalId === 0) {
      setServices([]);
      return;
    }

    try {
      const response = await serviceCatalogService.getServicesByHospital(hospitalId);
      setServices(response.data || []);
    } catch (error) {
      console.error('Error loading services for hospital:', error);
      setServices([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setBill(prev => ({ ...prev, [name]: value }));

      // Clear error for this field if any
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };
// Adding a specific handler for Select components to fix type issues
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    if (name) {
      setBill(prev => ({ ...prev, [name]: value }));

      // If hospital is changed, load services for that hospital
      if (name === 'hospitalId') {
        loadServicesByHospital(value);
      }

      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };
  const handleDateChange = (date: Date | null, fieldName: string) => {
    if (date) {
      setBill(prev => ({
        ...prev,
        [fieldName]: date.toISOString().split('T')[0]
      }));

      if (errors[fieldName]) {
        setErrors(prev => ({ ...prev, [fieldName]: '' }));
      }
    }
  };

  const handleSelectService = (service: ServiceCatalogDTO) => {
    setSelectedService(service);
    setServiceSearch('');
  };

  const handleAddItem = () => {
    if (!selectedService) return;

    const taxAmount = (selectedService.unitPrice * selectedService.taxPercentage / 100) * quantity;
    const totalBeforeTax = selectedService.unitPrice * quantity;

    const newItem: BillItemDTO = {
      serviceId: selectedService.id!,
      serviceName: selectedService.serviceName,
      serviceType: selectedService.serviceType,
      quantity,
      unitPrice: selectedService.unitPrice,
      taxPercentage: selectedService.taxPercentage,
      taxAmount: taxAmount,
      totalAmount: totalBeforeTax + taxAmount,
      // Keep backward compatibility
      totalBeforeTax,
      tax: taxAmount,
      total: totalBeforeTax + taxAmount
    };

    setBill(prev => ({
      ...prev,
      billItems: [...(prev.billItems || []), newItem]
    }));

    setSelectedService(null);
    setQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setBill(prev => ({
      ...prev,
      billItems: (prev.billItems || []).filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!bill.patientId) {
      newErrors.patientId = 'Patient is required';
    }

    if (!bill.hospitalId) {
      newErrors.hospitalId = 'Hospital is required';
    }

    if (!bill.billDate) {
      newErrors.billDate = 'Bill date is required';
    }

    if (!bill.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (!bill.billItems || bill.billItems.length === 0) {
      newErrors.items = 'At least one service item is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await billingService.createBill(bill as Bill);
      onSuccess();
    } catch (error) {
      console.error('Error creating bill:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const handlePatientChange = async (e: any) => {
    const { value } = e.target;

    // First update the form value as normal
    setBill(prev => ({ ...prev, patientId: value }));

    // Clear error if any
    if (errors.patientId) {
      setErrors(prev => ({ ...prev, patientId: '' }));
    }

    // If a valid patient is selected, fetch their details and medical records
    if (value) {
      await fetchPatientDetails(value);
    } else {
      setPatientDetails(null);
      setMedicalRecords([]);
    }
  };

  const fetchPatientDetails = async (patientId: number) => {
    try {
      const response = await patientService.getPatient(patientId);
      const patient = response.data;
      setPatientDetails(patient);

      // If patient has hospital assigned, auto-select it
      if (patient.hospitalId) {
        setBill(prev => ({ ...prev, hospitalId: patient.hospitalId }));
      }

      // Fetch medical records for this patient
      fetchPatientMedicalRecords(patientId);

    } catch (error) {
      console.error('Error fetching patient details:', error);
      setPatientDetails(null);
    }
  };

  const fetchPatientMedicalRecords = async (patientId: number) => {
    setIsLoadingRecords(true);
    try {
      const response = await medicalRecordService.getMedicalRecordsByPatient(patientId);
      setMedicalRecords(response.data);
    } catch (error) {
      console.error('Error fetching medical records:', error);
      setMedicalRecords([]);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  const toggleMedicalHistory = () => {
    setShowMedicalHistory(prev => !prev);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Function to add service from medical record to bill
  const addServiceFromMedicalRecord = (record: MedicalRecord) => {
    // Check if we have the service in our catalog
    const recordType = record.recordType || 'CONSULTATION';
    const relatedServices = services.filter(service =>
      service.serviceType === recordType ||
      service.serviceName.includes(recordType)
    );

    if (relatedServices.length > 0) {
      // Add the first matching service
      handleSelectService(relatedServices[0]);
    } else {
      // If no matching service, show message or handle accordingly
      console.log('No matching service found for this medical record');
    }
  };

  // Mock function for onSuccess
  const handleSuccess = () => {
    console.log('Bill created successfully!');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Create New Bill</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {/* Patient & Hospital Selection */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <FormControl fullWidth required error={!!errors.patientId}>
                <InputLabel>Patient</InputLabel>
                <Select
                  name="patientId"
                  value={bill.patientId || ''}
                  onChange={handlePatientChange}
                  label="Patient"
                >
                  <MenuItem value="">Select Patient</MenuItem>
                  {patients.map((patient) => (
                    <MenuItem key={patient.id} value={patient.id}>
                      {`${patient.firstName} ${patient.lastName}`}
                    </MenuItem>
                  ))}
                </Select>
                {errors.patientId && <FormHelperText>{errors.patientId}</FormHelperText>}
              </FormControl>

              <FormControl fullWidth required error={!!errors.hospitalId}>
                <InputLabel>Hospital</InputLabel>
                <Select
                  name="hospitalId"
                  value={bill.hospitalId || ''}
                  onChange={handleSelectChange}
                  label="Hospital"
                >
                  <MenuItem value="">Select Hospital</MenuItem>
                  {hospitals.map((hospital) => (
                    <MenuItem key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.hospitalId && <FormHelperText>{errors.hospitalId}</FormHelperText>}
              </FormControl>
            </Box>

            {/* Dates */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Bill Date"
                  value={bill.billDate ? new Date(bill.billDate) : null}
                  onChange={(date) => handleDateChange(date, 'billDate')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.billDate,
                      helperText: errors.billDate
                    }
                  }}
                />
              </LocalizationProvider>

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Due Date"
                  value={bill.dueDate ? new Date(bill.dueDate) : null}
                  onChange={(date) => handleDateChange(date, 'dueDate')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.dueDate,
                      helperText: errors.dueDate
                    }
                  }}
                />
              </LocalizationProvider>
            </Box>

            <TextField
              name="notes"
              label="Notes"
              value={bill.notes || ''}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
            />

            {/* Patient Details & Medical History Section - Only shown when patient is selected */}
            {patientDetails && (
              <>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      Patient Information
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<HistoryIcon />}
                      onClick={toggleMedicalHistory}
                      color="primary"
                    >
                      {showMedicalHistory ? "Hide Medical History" : "Show Medical History"}
                    </Button>
                  </Box>

                  <Paper variant="outlined" sx={{ p: 2, mb: showMedicalHistory ? 2 : 0 }}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                        <Typography variant="body1" gutterBottom>
                          {patientDetails.firstName} {patientDetails.lastName}
                        </Typography>

                        <Typography variant="subtitle2" color="text.secondary">Contact</Typography>
                        <Typography variant="body1" gutterBottom>
                          {patientDetails.email} • {patientDetails.phone}
                        </Typography>
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">Date of Birth</Typography>
                        <Typography variant="body1" gutterBottom>
                          {formatDate(patientDetails.dateOfBirth)} • {patientDetails.gender}
                        </Typography>

                        <Typography variant="subtitle2" color="text.secondary">Blood Group</Typography>
                        <Typography variant="body1" gutterBottom>
                          {patientDetails.bloodGroup || 'Not specified'}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>

                  {/* Medical History - Shown only when toggled */}
                  {showMedicalHistory && (
                    <Paper variant="outlined" sx={{ mt: 2, p: 0, maxHeight: '300px', overflow: 'auto' }}>
                      {isLoadingRecords ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                          <CircularProgress size={24} />
                        </Box>
                      ) : medicalRecords.length > 0 ? (
                        <List sx={{ p: 0 }}>
                          {medicalRecords.map((record) => (
                            <ListItem
                              key={record.id}
                              sx={{
                                borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                                '&:last-child': { borderBottom: 'none' }
                              }}
                              secondaryAction={
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => addServiceFromMedicalRecord(record)}
                                >
                                  Add Service
                                </Button>
                              }
                            >
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="subtitle1">
                                      {record.diagnosis || record.recordType || 'Medical Record'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {formatDate(record.visitDate)}
                                    </Typography>
                                  </Box>
                                }
                                secondary={
                                  <>
                                    <Typography variant="body2" component="span">
                                      {record.treatment || record.notes || 'No details available'}
                                    </Typography>
                                    {record.treatingDoctor && (
                                      <Typography variant="body2" color="text.secondary" component="div">
                                        Dr. {record.treatingDoctor.name}
                                      </Typography>
                                    )}
                                  </>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            No medical records found for this patient.
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  )}
                </Box>
              </>
            )}

            {/* Service Items Section */}
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6" gutterBottom>Service Items</Typography>

            {/* Add Service Form */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-start' }}>
              <TextField
                label="Search Services"
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                sx={{ flexGrow: 1 }}
              />

              <TextField
                label="Quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                inputProps={{ min: 1 }}
                sx={{ width: '100px' }}
                disabled={!selectedService}
              />

              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddItem}
                disabled={!selectedService}
              >
                Add
              </Button>
            </Box>

            {/* Service Search Results */}
            {serviceSearch && filteredServices.length > 0 && (
              <Paper variant="outlined" sx={{ maxHeight: '200px', overflow: 'auto', mb: 2 }}>
                <List>
                  {filteredServices.map((service) => (
                    <ListItem
                      key={service.id}
                      component="div"
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleSelectService(service)}
                    >
                      <ListItemText
                        primary={`${service.serviceName} (${service.serviceCode})`}
                        secondary={`${formatCurrency(service.unitPrice)} | ${service.category}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}

            {selectedService && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle1">
                  Selected: {selectedService.serviceName} ({selectedService.serviceCode})
                </Typography>
                <Typography variant="body2">
                  Price: {formatCurrency(selectedService.unitPrice)} |
                  Tax: {selectedService.taxPercentage}%
                </Typography>
              </Paper>
            )}

            {/* Items Table */}
            {bill.billItems && bill.billItems.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Service</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Tax</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bill.billItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.serviceName}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.taxAmount || item.tax || 0)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.totalAmount || item.total || 0)}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                No service items added yet.
              </Typography>
            )}

            {/* Totals */}
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'medium' }}>
              <Typography variant="body1">Subtotal:</Typography>
              <Typography variant="body1">{formatCurrency(bill.subtotal || 0)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'medium' }}>
              <Typography variant="body1">Tax:</Typography>
              <Typography variant="body1">{formatCurrency(bill.tax || 0)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'medium' }}>
              <Typography variant="body1">Total Amount:</Typography>
              <Typography variant="body1">{formatCurrency(bill.totalAmount || 0)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'medium' }}>
              <Typography variant="body1">Balance Due:</Typography>
              <Typography variant="body1">{formatCurrency(bill.balanceDue || 0)}</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Create Bill'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateBillDialog;
