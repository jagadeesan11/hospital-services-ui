import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Fab,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import { Patient } from '../../services/patientService';
import { MedicalRecord, medicalRecordService } from '../../services/medicalRecordService';
import { Doctor, doctorService } from '../../services/doctorService';
import { emailService } from '../../services/emailService';
import AddMedicalRecordDialog from './AddMedicalRecordDialog';
import EditMedicalRecordDialog from './EditMedicalRecordDialog';

interface ViewMedicalRecordsDialogProps {
  open: boolean;
  patient: Patient;
  onClose: () => void;
}

const ViewMedicalRecordsDialog: React.FC<ViewMedicalRecordsDialogProps> = ({
  open,
  patient,
  onClose,
}) => {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (open && patient.id) {
      loadMedicalRecords();
      loadDoctors();
    }
  }, [open, patient.id]);

  const loadMedicalRecords = async () => {
    try {
      const response = await medicalRecordService.getMedicalRecordsByPatient(patient.id!);
      console.log('Raw medical records response:', response.data);
      console.log('First medical record structure:', response.data[0]);
      setMedicalRecords(response.data);
    } catch (error) {
      console.error('Error loading medical records:', error);
    }
  };

  const loadDoctors = async () => {
    try {
      // Load doctors for the patient's hospital
      if (patient.hospitalId) {
        const response = await doctorService.getAllDoctors();
        // Filter doctors by hospital if needed, or use all doctors
        setDoctors(response.data);
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const getDoctorName = (treatingDoctor: any) => {
    if (!treatingDoctor) {
      return 'No Doctor Assigned';
    }
    return `${treatingDoctor.name} - ${treatingDoctor.specialization}`;
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this medical record?')) {
      try {
        await medicalRecordService.deleteMedicalRecord(id);
        loadMedicalRecords();
      } catch (error) {
        console.error('Error deleting medical record:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleSendEmail = async () => {
    try {
      const medicalRecordsHtml = medicalRecords.map(record => {
        const doctorName = getDoctorName(record.treatingDoctor);
        return `
          <div style="border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; background-color: #f9f9f9;">
            <h3 style="color: #2c5aa0; margin-top: 0;">Medical Record</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 5px; font-weight: bold; width: 25%;">Date:</td>
                <td style="padding: 5px;">${formatDate(record.visitDate)}</td>
              </tr>
              <tr>
                <td style="padding: 5px; font-weight: bold;">Doctor:</td>
                <td style="padding: 5px;">${doctorName}</td>
              </tr>
              <tr>
                <td style="padding: 5px; font-weight: bold;">Record Type:</td>
                <td style="padding: 5px;">${record.recordType}</td>
              </tr>
              <tr>
                <td style="padding: 5px; font-weight: bold;">Diagnosis:</td>
                <td style="padding: 5px;">${record.diagnosis}</td>
              </tr>
              <tr>
                <td style="padding: 5px; font-weight: bold;">Treatment:</td>
                <td style="padding: 5px;">${record.treatment}</td>
              </tr>
              <tr>
                <td style="padding: 5px; font-weight: bold;">Prescription:</td>
                <td style="padding: 5px;">${record.prescriptions || 'N/A'}</td>
              </tr>
              ${record.notes ? `
              <tr>
                <td style="padding: 5px; font-weight: bold;">Notes:</td>
                <td style="padding: 5px;">${record.notes}</td>
              </tr>
              ` : ''}
            </table>
          </div>`;
      }).join('');

      const emailSubject = `Medical Records Summary - ${patient.firstName} ${patient.lastName}`;
      const emailBodyHtml = `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #2c5aa0; text-align: center; border-bottom: 2px solid #2c5aa0; padding-bottom: 10px;">
                Medical Records Summary
              </h1>

              <div style="background-color: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h2 style="color: #2c5aa0; margin-top: 0;">Patient Information</h2>
                <p><strong>Name:</strong> ${patient.firstName} ${patient.lastName}</p>
                <p><strong>Email:</strong> ${patient.email}</p>
                <p><strong>Phone:</strong> ${patient.phone || 'N/A'}</p>
                <p><strong>Date of Birth:</strong> ${patient.dateOfBirth ? formatDate(patient.dateOfBirth) : 'N/A'}</p>
              </div>

              <h2 style="color: #2c5aa0;">Medical Records</h2>
              ${medicalRecordsHtml}

              <div style="margin-top: 30px; padding: 15px; background-color: #f0f8ff; border-left: 4px solid #2c5aa0;">
                <p><strong>Important Note:</strong> This medical records summary is confidential and intended only for the patient.
                If you have any questions about your medical records, please contact your healthcare provider.</p>
              </div>

              <div style="margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
                <p>Best regards,<br>
                <strong>Healthcare Team</strong></p>
                <p style="font-size: 12px;">This email was generated automatically. Please do not reply to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      await emailService.sendHtmlEmail(patient.email, emailSubject, emailBodyHtml);
      console.log('Medical records email sent successfully');
      alert('Medical records summary sent to patient email successfully!');
    } catch (error) {
      console.error('Failed to send medical records email:', error);
      alert('Failed to send email. Please try again later.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Medical Records - {`${patient.firstName} ${patient.lastName}`}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Fab
              color="secondary"
              size="small"
              onClick={handleSendEmail}
              title="Send Medical Records via Email"
            >
              <EmailIcon />
            </Fab>
            <Fab
              color="primary"
              size="small"
              onClick={() => setIsAddDialogOpen(true)}
              title="Add Medical Record"
            >
              <AddIcon />
            </Fab>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Visit Date</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Record Type</TableCell>
                <TableCell>Diagnosis</TableCell>
                <TableCell>Treatment</TableCell>
                <TableCell>Prescription</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {medicalRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{formatDate(record.visitDate)}</TableCell>
                  <TableCell>{getDoctorName(record.treatingDoctor)}</TableCell>
                  <TableCell>{record.recordType}</TableCell>
                  <TableCell>{record.diagnosis}</TableCell>
                  <TableCell>{record.treatment}</TableCell>
                  <TableCell>{record.prescriptions || 'N/A'}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => {
                        setSelectedRecord(record);
                        setIsEditDialogOpen(true);
                      }}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(record.id!)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {medicalRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No medical records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>

      <AddMedicalRecordDialog
        open={isAddDialogOpen}
        patientId={patient.id!}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={() => {
          setIsAddDialogOpen(false);
          loadMedicalRecords();
        }}
        onError={(error) => {
          console.error('Error adding medical record:', error);
        }}
      />

      {selectedRecord && (
        <EditMedicalRecordDialog
          open={isEditDialogOpen}
          medicalRecord={selectedRecord}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedRecord(null);
          }}
          onSuccess={() => {
            setIsEditDialogOpen(false);
            setSelectedRecord(null);
            loadMedicalRecords();
          }}
          onError={(error) => {
            console.error('Error updating medical record:', error);
          }}
        />
      )}
    </Dialog>
  );
};

export default ViewMedicalRecordsDialog;
