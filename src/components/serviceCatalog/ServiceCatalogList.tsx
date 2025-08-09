import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, TextField, FormControl, InputLabel,
  Select, MenuItem, Chip, IconButton, Tooltip, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import SearchIcon from '@mui/icons-material/Search';
import { ServiceCatalogDTO, ServiceType, ServiceCategory, serviceCatalogService } from '../../services/serviceCatalogService';
import { hospitalService } from '../../services/hospitalService';
import CreateServiceDialog from './CreateServiceDialog';
import EditServiceDialog from './EditServiceDialog';

const ServiceCatalogList: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [services, setServices] = useState<ServiceCatalogDTO[]>([]);
  const [filteredServices, setFilteredServices] = useState<ServiceCatalogDTO[]>([]);
  const [hospitals, setHospitals] = useState<{ id: number, name: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedHospital, setSelectedHospital] = useState<number | string>('');
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<ServiceCatalogDTO | null>(null);

  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    if (selectedHospital && selectedHospital !== '') {
      fetchServicesByHospital(selectedHospital as number);
    } else {
      setServices([]);
      setFilteredServices([]);
    }
  }, [selectedHospital]);

  useEffect(() => {
    filterServices();
  }, [searchTerm, selectedType, selectedCategory, services]);

  const fetchHospitals = async () => {
    try {
      const response = await hospitalService.getAllHospitals();
      setHospitals(response.data || []);
      // Auto-select first hospital if available
      if (response.data && response.data.length > 0) {
        setSelectedHospital(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      setHospitals([]);
    }
  };

  const fetchServicesByHospital = async (hospitalId: number) => {
    setLoading(true);
    try {
      const response = await serviceCatalogService.getServicesByHospital(hospitalId);
      setServices(response.data || []);
      setFilteredServices(response.data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
      setFilteredServices([]);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = [...services];

    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.serviceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType) {
      filtered = filtered.filter(service => service.serviceType === selectedType);
    }

    if (selectedCategory) {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    setFilteredServices(filtered);
  };

  const handleDeactivateService = async (serviceId: number) => {
    try {
      await serviceCatalogService.deactivateService(serviceId);
      fetchServicesByHospital(selectedHospital as number); // Refresh the list
    } catch (error) {
      console.error('Error deactivating service:', error);
    }
  };

  const handleEditClick = (service: ServiceCatalogDTO) => {
    setSelectedService(service);
    setEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    fetchServicesByHospital(selectedHospital as number);
  };

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    fetchServicesByHospital(selectedHospital as number);
  };

  const handleHospitalChange = (hospitalId: number | string) => {
    setSelectedHospital(hospitalId);
    // Reset other filters when hospital changes
    setSelectedType('');
    setSelectedCategory('');
    setSearchTerm('');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" component="h1">Service Catalog</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Add Service
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            label="Search"
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
            <InputLabel>Type</InputLabel>
            <Select
              value={selectedType}
              label="Type"
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <MenuItem value="">All Types</MenuItem>
              {Object.values(ServiceType).map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: '150px' }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {Object.values(ServiceCategory).map((category) => (
                <MenuItem key={category} value={category}>
                  {category.replace(/_/g, ' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: '150px' }}>
            <InputLabel>Hospital</InputLabel>
            <Select
              value={selectedHospital}
              label="Hospital"
              onChange={(e) => handleHospitalChange(e.target.value)}
            >
              <MenuItem value="">All Hospitals</MenuItem>
              {hospitals.map((hospital) => (
                <MenuItem key={hospital.id} value={hospital.id}>
                  {hospital.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Service Code</TableCell>
                <TableCell>Service Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Unit Price</TableCell>
                <TableCell>Tax %</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.serviceCode}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {service.serviceName}
                      </Typography>
                      {service.description && (
                        <Typography variant="caption" color="text.secondary">
                          {service.description}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{service.serviceType}</TableCell>
                  <TableCell>{service.category.replace(/_/g, ' ')}</TableCell>
                  <TableCell>₹{service.unitPrice.toFixed(2)}</TableCell>
                  <TableCell>{service.taxPercentage}%</TableCell>
                  <TableCell>
                    <Chip
                      label={service.isActive ? 'Active' : 'Inactive'}
                      color={service.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit Service">
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(service)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {service.isActive && (
                      <Tooltip title="Deactivate Service">
                        <IconButton
                          size="small"
                          onClick={() => handleDeactivateService(service.id!)}
                          color="error"
                        >
                          <BlockIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredServices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body1" color="text.secondary">
                      No services found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog Components */}
      <CreateServiceDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditServiceDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSuccess={handleEditSuccess}
        service={selectedService}
      />
    </Box>
  );
};

export default ServiceCatalogList;
