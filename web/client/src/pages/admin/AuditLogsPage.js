import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Table, TableHead, TableRow, TableCell, TableBody, TablePagination, Paper, Chip, TextField, Button, Stack, Tooltip } from '@mui/material';
import { adminAPI } from '../../services/api';
import { Refresh } from '@mui/icons-material';
import RoleBadge from '../../components/admin/RoleBadge';

const ACTION_COLORS = {
  create_user: 'success',
  update_user: 'info',
  update_user_role: 'warning',
  update_user_status: 'warning',
  schedule_news: 'info',
  reschedule_news: 'info',
  create_news: 'success',
  update_news: 'warning',
  delete_news: 'error',
  auto_publish: 'secondary'
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ actor: '', action: '', entityType: '' });
  const [loading, setLoading] = useState(false);

  const load = async (resetPage=false) => {
    try {
      setLoading(true);
      const params = { page: resetPage ? 1 : page+1, limit: rowsPerPage };
      Object.entries(filters).forEach(([k,v]) => { if (v) params[k]=v; });
      const res = await adminAPI.getAuditLogs(params);
      setLogs(res.data.logs);
      setTotal(res.data.total);
      if (resetPage) setPage(0);
    } catch (e) {
      console.error('Audit load error', e);
    } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); // eslint-disable-next-line
  },[page, rowsPerPage]);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = e => { setRowsPerPage(parseInt(e.target.value,10)); setPage(0); };

  return (
    <Container maxWidth="xl" sx={{ py:4 }}>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:3, flexWrap:'wrap', gap:2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Audit Logs</Typography>
          <Typography variant="body2" color="text.secondary">System activity and content changes</Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button startIcon={<Refresh />} variant="outlined" onClick={()=>load(true)} disabled={loading}>Refresh</Button>
        </Stack>
      </Box>

      <Paper sx={{ p:2, mb:2 }}>
        <Stack direction={{ xs:'column', sm:'row' }} spacing={2}>
          <TextField label="Actor Email" size="small" value={filters.actor} onChange={e=>setFilters(f=>({...f, actor:e.target.value}))} />
          <TextField label="Action" size="small" value={filters.action} onChange={e=>setFilters(f=>({...f, action:e.target.value}))} />
            <TextField label="Entity Type" size="small" value={filters.entityType} onChange={e=>setFilters(f=>({...f, entityType:e.target.value}))} />
          <Button variant="contained" onClick={()=>load(true)} disabled={loading}>Apply</Button>
          <Button onClick={()=>{ setFilters({actor:'', action:'', entityType:''}); load(true); }} disabled={loading}>Clear</Button>
        </Stack>
      </Paper>

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Actor</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Entity</TableCell>
              <TableCell>Summary</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map(l => (
              <TableRow key={l._id} hover>
                <TableCell>{new Date(l.createdAt).toLocaleString()}</TableCell>
                <TableCell>{l.actorEmail}</TableCell>
                <TableCell>
                  <Chip size="small" label={l.action} color={ACTION_COLORS[l.action] || 'default'} />
                </TableCell>
                <TableCell>{l.entityType}{l.entityId ? `:${l.entityId.slice(-6)}`:''}</TableCell>
                <TableCell>
                  <Tooltip title={JSON.stringify(l.diff || {}, null, 2)} placement="left" enterDelay={600} arrow>
                    <span>{l.summary || '-'}</span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && !loading && (
              <TableRow><TableCell colSpan={5} align="center">No logs</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10,20,50,100]}
        />
      </Paper>
    </Container>
  );
}
