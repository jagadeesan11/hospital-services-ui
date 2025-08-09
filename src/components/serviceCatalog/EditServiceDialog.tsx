import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormControl, InputLabel, Select,
  MenuItem, FormHelperText, Stack, Box, Switch, FormControlLabel,
  CircularProgress
} from '@mui/material';
import { ServiceCatalogDTO, ServiceType, ServiceCategory, serviceCatalogService } from '../../services/serviceCatalogService';
import { hospitalService } from '../../services/hospitalService';
import { departmentService } from '../../services/departmentService';

interface EditServiceDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  service: ServiceCatalogDTO | null;
}

const EditServiceDialog: React.FC<EditServiceDialogProps> = ({
  open,
  onClose,
  onSuccess,
  service
}) => {
  const [formData, setFormData] = useState<ServiceCatalogDTO | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hospitals, setHospitals] = useState<{ id: number, name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: number, name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  useEffect(() => {
    if (open && service) {
      setFormData(service);
      fetchHospitalsAndDepartments();
    }
  }, [open, service]);

  const fetchHospitalsAndDepartments = async () => {
    setIsLoadingData(true);
    try {
      console.log('Fetching hospitals and departments for edit dialog...');

      // Fetch hospitals first
      try {
        const hospitalsResponse = await hospitalService.getAllHospitals();
        console.log('Hospitals response:', hospitalsResponse);
        console.log('Hospitals data:', hospitalsResponse.data);
        console.log('Hospitals array length:', hospitalsResponse.data ? hospitalsResponse.data.length : 'No data');

        if (hospitalsResponse.data && Array.isArray(hospitalsResponse.data)) {
          setHospitals(hospitalsResponse.data);
        } else {
          console.warn('Hospitals data is not an array:', hospitalsResponse.data);
          setHospitals([]);
        }
      } catch (hospitalError) {
        console.error('Error fetching hospitals:', hospitalError);
        setHospitals([]);
      }

      // If we have a hospital ID in formData, fetch departments for that hospital
      if (formData && formData.hospitalId) {
        try {
          const departmentsResponse = await departmentService.getDepartmentsByHospital(formData.hospitalId);
          console.log('Departments response:', departmentsResponse);
          console.log('Departments data:', departmentsResponse.data);

          if (departmentsResponse.data && Array.isArray(departmentsResponse.data)) {
            setDepartments(departmentsResponse.data);
          } else {
            console.warn('Departments data is not an array:', departmentsResponse.data);
            setDepartments([]);
          }
        } catch (departmentError) {
          console.error('Error fetching departments:', departmentError);
          setDepartments([]);
        }
      } else {
        // No hospital selected, clear departments
        setDepartments([]);
      }

    } catch (error) {
      console.error('General error in fetchHospitalsAndDepartments:', error);
      setHospitals([]);
      setDepartments([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Add a new function to fetch departments when hospital changes
  const fetchDepartmentsByHospital = async (hospitalId: number) => {
    if (!hospitalId) {
      setDepartments([]);
      return;
    }

    try {
      const departmentsResponse = await departmentService.getDepartmentsByHospital(hospitalId);
      console.log('Departments response for hospital', hospitalId, ':', departmentsResponse);

      if (departmentsResponse.data && Array.isArray(departmentsResponse.data)) {
        setDepartments(departmentsResponse.data);
      } else {
        console.warn('Departments data is not an array:', departmentsResponse.data);
        setDepartments([]);
      }
    } catch (error) {
      console.error('Error fetching departments for hospital', hospitalId, ':', error);
      setDepartments([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name && formData) {
      setFormData({ ...formData, [name]: value });

      // Clear error for this field if any
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  // Adding a specific handler for Select components to fix type issues
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    if (name && formData) {
      setFormData({ ...formData, [name]: value });

      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }

      // If hospital is changed, fetch departments for the new hospital
      if (name === 'hospitalId' && value) {
        // Clear department selection when hospital changes
        setFormData(prev => prev ? { ...prev, hospitalId: value, departmentId: undefined } : null);
        fetchDepartmentsByHospital(value);
      }
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name && formData) {
      const numValue = parseFloat(value);
      setFormData({ ...formData, [name]: isNaN(numValue) ? 0 : numValue });

      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    if (formData) {
      setFormData({ ...formData, [name]: checked });
    }
  };

  const validateForm = (): boolean => {
    if (!formData) return false;

    const newErrors: Record<string, string> = {};

    if (!formData.serviceCode) newErrors.serviceCode = 'Service code is required';
    if (!formData.serviceName) newErrors.serviceName = 'Service name is required';
    if (!formData.serviceType) newErrors.serviceType = 'Service type is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (formData.unitPrice < 0) newErrors.unitPrice = 'Price cannot be negative';
    if (formData.taxPercentage < 0) newErrors.taxPercentage = 'Tax percentage cannot be negative';
    if (formData.hospitalId === 0) newErrors.hospitalId = 'Hospital is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !formData || !formData.id) {
      return;
    }

    setIsSubmitting(true);
    try {
      await serviceCatalogService.updateService(formData.id, formData);
      onSuccess();
    } catch (error) {
      console.error('Error updating service:', error);
      // You might want to show a snackbar or other notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    setFormData(null);
    setErrors({});
    onClose();
  };

  if (!formData) {
    return (
      <Dialog open={open} onClose={handleDialogClose}>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleDialogClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit Service</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Basic Information */}
            <Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  name="serviceCode"
                  label="Service Code"
                  value={formData.serviceCode || ''}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.serviceCode}
                  helperText={errors.serviceCode}
                />
                <TextField
                  name="serviceName"
                  label="Service Name"
                  value={formData.serviceName || ''}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.serviceName}
                  helperText={errors.serviceName}
                />
              </Stack>
            </Box>

            {/* Service Type and Category */}
            <Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth required error={!!errors.serviceType}>
                  <InputLabel>Service Type</InputLabel>
                  <Select
                    name="serviceType"
                    value={formData.serviceType || ''}
                    onChange={handleSelectChange}
                    label="Service Type"
                  >
                    {Object.values(ServiceType).map((type) => (
                      <MenuItem key={type} value={type}>
                        {type.replace(/_/g, ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.serviceType && <FormHelperText>{errors.serviceType}</FormHelperText>}
                </FormControl>

                <FormControl fullWidth required error={!!errors.category}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category || ''}
                    onChange={handleSelectChange}
                    label="Category"
                  >
                    {Object.values(ServiceCategory).map((category) => (
                      <MenuItem key={category} value={category}>
                        {category.replace(/_/g, ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
                </FormControl>
              </Stack>
            </Box>

            {/* Hospital and Department */}
            <Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth required error={!!errors.hospitalId}>
                  <InputLabel>Hospital</InputLabel>
                  <Select
                    name="hospitalId"
                    value={formData.hospitalId || ''}
                    onChange={handleSelectChange}
                    label="Hospital"
                    disabled={isLoadingData}
                  >
                    {isLoadingData ? (
                      <MenuItem disabled>
                        <CircularProgress size={24} sx={{ mr: 1 }} />
                        Loading hospitals...
                      </MenuItem>
                    ) : hospitals.length > 0 ? (
                      hospitals.map((hospital) => (
                        <MenuItem key={hospital.id} value={hospital.id}>
                          {hospital.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No hospitals found</MenuItem>
                    )}
                  </Select>
                  {errors.hospitalId && <FormHelperText>{errors.hospitalId}</FormHelperText>}
                </FormControl>

                <FormControl fullWidth error={!!errors.departmentId}>
                  <InputLabel>Department (Optional)</InputLabel>
                  <Select
                    name="departmentId"
                    value={formData.departmentId || ''}
                    onChange={handleSelectChange}
                    label="Department (Optional)"
                    disabled={isLoadingData}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {isLoadingData ? (
                      <MenuItem disabled>
                        <CircularProgress size={24} sx={{ mr: 1 }} />
                        Loading departments...
                      </MenuItem>
                    ) : departments.length > 0 ? (
                      departments.map((department) => (
                        <MenuItem key={department.id} value={department.id}>
                          {department.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No departments found</MenuItem>
                    )}
                  </Select>
                  {errors.departmentId && <FormHelperText>{errors.departmentId}</FormHelperText>}
                </FormControl>
              </Stack>
            </Box>

            {/* Pricing */}
            <Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  name="unitPrice"
                  label="Unit Price"
                  type="number"
                  value={formData.unitPrice || 0}
                  onChange={handleNumberChange}
                  fullWidth
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                  error={!!errors.unitPrice}
                  helperText={errors.unitPrice}
                />
                <TextField
                  name="taxPercentage"
                  label="Tax Percentage"
                  type="number"
                  value={formData.taxPercentage || 0}
                  onChange={handleNumberChange}
                  fullWidth
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                  error={!!errors.taxPercentage}
                  helperText={errors.taxPercentage}
                />
              </Stack>
            </Box>

            {/* Description */}
            <TextField
              name="description"
              label="Description"
              value={formData.description || ''}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
            />

            {/* Status */}
            <FormControlLabel
              control={
                <Switch
                  name="isActive"
                  checked={formData.isActive || false}
                  onChange={handleSwitchChange}
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Update Service'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditServiceDialog;
