import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormControl, InputLabel, Select,
  MenuItem, FormHelperText, Stack, Box, Switch, FormControlLabel
} from '@mui/material';
import { ServiceCatalogDTO, ServiceType, ServiceCategory, serviceCatalogService } from '../../services/serviceCatalogService';
import { hospitalService } from '../../services/hospitalService';
import { departmentService } from '../../services/departmentService';

interface CreateServiceDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateServiceDialog: React.FC<CreateServiceDialogProps> = ({ open, onClose, onSuccess }) => {
  const initialFormState: ServiceCatalogDTO = {
    serviceCode: '',
    serviceName: '',
    description: '',
    serviceType: ServiceType.CONSULTATION,
    category: ServiceCategory.GENERAL_CONSULTATION,
    unitPrice: 0,
    taxPercentage: 0,
    isActive: true,
    hospitalId: 0
  };

  const [formData, setFormData] = useState<ServiceCatalogDTO>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hospitals, setHospitals] = useState<{ id: number, name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: number, name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      fetchHospitalsAndDepartments();
    }
  }, [open]);

  const fetchHospitalsAndDepartments = async () => {
    setIsLoadingData(true);
    try {
      // Fetch hospitals from backend
      const hospitalsResponse = await hospitalService.getAllHospitals();
      setHospitals(hospitalsResponse.data || []);

      // Only fetch departments if a hospital is already selected
      if (formData.hospitalId && formData.hospitalId !== 0) {
        const departmentsResponse = await departmentService.getDepartmentsByHospital(formData.hospitalId);
        setDepartments(departmentsResponse.data || []);
      } else {
        setDepartments([]);
      }
    } catch (error) {
      console.error('Error fetching hospitals and departments:', error);
      // Set empty arrays as fallback
      setHospitals([]);
      setDepartments([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  // New function to fetch departments when hospital changes
  const fetchDepartmentsByHospital = async (hospitalId: number) => {
    if (!hospitalId || hospitalId === 0) {
      setDepartments([]);
      return;
    }

    try {
      const departmentsResponse = await departmentService.getDepartmentsByHospital(hospitalId);
      setDepartments(departmentsResponse.data || []);
    } catch (error) {
      console.error('Error fetching departments for hospital:', error);
      setDepartments([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }));

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

      // If hospital is changed, fetch departments for that hospital
      if (name === 'hospitalId') {
        fetchDepartmentsByHospital(value);
        // Reset department selection when hospital changes
        setFormData(prev => ({ ...prev, hospitalId: value, departmentId: undefined }));
      }

      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name) {
      const numValue = parseFloat(value);
      setFormData(prev => ({ ...prev, [name]: isNaN(numValue) ? 0 : numValue }));

      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const validateForm = (): boolean => {
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

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await serviceCatalogService.createService(formData);
      onSuccess();
      resetForm();
    } catch (error) {
      console.error('Error creating service:', error);
      // You might want to show a snackbar or other notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setErrors({});
  };

  const handleDialogClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleDialogClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add New Service</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                name="serviceCode"
                label="Service Code"
                value={formData.serviceCode}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.serviceCode}
                helperText={errors.serviceCode}
              />
              <TextField
                name="serviceName"
                label="Service Name"
                value={formData.serviceName}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.serviceName}
                helperText={errors.serviceName}
              />
            </Box>
            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth required error={!!errors.serviceType}>
                <InputLabel>Service Type</InputLabel>
                <Select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleSelectChange}
                  label="Service Type"
                >
                  {Object.values(ServiceType).map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
                {errors.serviceType && <FormHelperText>{errors.serviceType}</FormHelperText>}
              </FormControl>
              <FormControl fullWidth required error={!!errors.category}>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
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
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                name="unitPrice"
                label="Unit Price"
                type="number"
                value={formData.unitPrice}
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
                value={formData.taxPercentage}
                onChange={handleNumberChange}
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                error={!!errors.taxPercentage}
                helperText={errors.taxPercentage}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth required error={!!errors.hospitalId}>
                <InputLabel>Hospital</InputLabel>
                <Select
                  name="hospitalId"
                  value={formData.hospitalId}
                  onChange={handleSelectChange}
                  label="Hospital"
                >
                  <MenuItem value={0}>Select Hospital</MenuItem>
                  {hospitals.map((hospital) => (
                    <MenuItem key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.hospitalId && <FormHelperText>{errors.hospitalId}</FormHelperText>}
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  name="departmentId"
                  value={formData.departmentId || ''}
                  onChange={handleSelectChange}
                  label="Department"
                >
                  <MenuItem value="">None</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleSwitchChange}
                  color="primary"
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={isSubmitting}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Service'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateServiceDialog;
