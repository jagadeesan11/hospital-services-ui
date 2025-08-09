import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  SelectChangeEvent
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Block, blockService } from '../../services/blockService';
import { Hospital, hospitalService } from '../../services/hospitalService';
import AddBlockDialog from './AddBlockDialog';
import EditBlockDialog from './EditBlockDialog';

const BlockList: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<number | ''>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const initData = async () => {
      await loadHospitals();
      // Don't call loadBlocks() here as selectedHospital is still empty
    };
    initData();
  }, []);

  // Load blocks when hospitals are loaded and auto-select first hospital
  useEffect(() => {
    if (hospitals.length > 0 && !selectedHospital) {
      const firstHospital = hospitals[0];
      setSelectedHospital(firstHospital.id!);
      // loadBlocks will be called by the selectedHospital useEffect
    }
  }, [hospitals, selectedHospital]);

  // Load blocks whenever selectedHospital changes
  useEffect(() => {
    if (selectedHospital) {
      loadBlocks();
    }
  }, [selectedHospital]);

  const loadHospitals = async () => {
    try {
      const response = await hospitalService.getAllHospitals();
      // Extract hospitals array from response
      const hospitalsData = Array.isArray(response.data) ? response.data : [];
      setHospitals(hospitalsData);
    } catch (error) {
      console.error('Error loading hospitals:', error);
      setErrorMessage('Failed to load hospitals');
    }
  };

  const loadBlocks = async () => {
    try {
      if (selectedHospital) {
        const response = await blockService.getBlocksByHospital(selectedHospital as number);
        setBlocks(response.data);
      } else {
        // If no hospital selected, show no blocks since blocks belong to hospitals
        setBlocks([]);
      }
    } catch (error) {
      console.error('Error loading blocks:', error);
      setErrorMessage('Failed to load blocks');
    }
  };

  const loadBlocksByHospital = async (hospital_id: number) => {
    try {
      const response = await blockService.getBlocksByHospital(hospital_id);
      setBlocks(response.data);
    } catch (error) {
      console.error('Error loading blocks by hospital:', error);
      setErrorMessage('Failed to load blocks for selected hospital');
    }
  };

  const handleHospitalChange = (event: SelectChangeEvent<number | ''>) => {
    const hospitalId = event.target.value;
    setSelectedHospital(hospitalId);
    // loadBlocks() will be called automatically by useEffect when selectedHospital changes
  };

  const handleDelete = async (id: number) => {
    try {
      await blockService.deleteBlock(id);
      if (selectedHospital) {
        loadBlocksByHospital(selectedHospital as number);
      } else {
        loadBlocks();
      }
      setSuccessMessage('Block deleted successfully');
    } catch (error) {
      console.error('Error deleting block:', error);
      setErrorMessage('Failed to delete block');
    }
  };

  const handleAddSuccess = () => {
    if (selectedHospital) {
      loadBlocksByHospital(selectedHospital as number);
    } else {
      loadBlocks();
    }
    setSuccessMessage('Block added successfully');
  };

  const handleEdit = (block: Block) => {
    setSelectedBlock(block);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    if (selectedHospital) {
      loadBlocksByHospital(selectedHospital as number);
    } else {
      loadBlocks();
    }
    setSuccessMessage('Block updated successfully');
  };

  const getHospitalName = (block: Block) => {
    // Use the nested hospital object if available, otherwise fall back to lookup
    if (block.hospital && block.hospital.name) {
      return block.hospital.name;
    }
    // Fallback to looking up in hospitals array if hospital object is not available
    const hospital = hospitals.find(h => h.id === block.hospital_id);
    return hospital ? hospital.name : 'Unknown Hospital';
  };

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Filter by Hospital</InputLabel>
          <Select
            value={selectedHospital}
            label="Filter by Hospital"
            onChange={handleHospitalChange}
          >
            <MenuItem value="">
              <em>All Hospitals</em>
            </MenuItem>
            {hospitals.map((hospital) => (
              <MenuItem key={hospital.id} value={hospital.id}>
                {hospital.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Button
          variant="contained"
          color="primary"
          style={{ margin: '16px' }}
          onClick={() => setIsAddDialogOpen(true)}
        >
          Add New Block
        </Button>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Hospital</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {blocks.map((block) => (
              <TableRow key={block.id}>
                <TableCell>{block.name}</TableCell>
                <TableCell>{getHospitalName(block)}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleEdit(block)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => block.id && handleDelete(block.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <AddBlockDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={handleAddSuccess}
      />

      <EditBlockDialog
        open={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedBlock(null);
        }}
        onSuccess={handleEditSuccess}
        block={selectedBlock}
      />

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert severity="success" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage('')}
      >
        <Alert severity="error" onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BlockList;
