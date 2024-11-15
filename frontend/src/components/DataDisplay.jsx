import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from './ui/table';
import _ from 'lodash';

const DataDisplay = ({ data, period }) => {
  if (!data || data.length === 0) return null;

  // Função auxiliar para validar e converter datas
  const parseDate = (dateStr) => {
    if (!dateStr || dateStr === 'EM ATENDIMENTO') return null;
    try {
      const [day, month, year] = dateStr.split('/').map(Number);
      return new Date(year, month - 1, day);
    } catch {
      return null;
    }
  };

  // Filtra os dados pelo período selecionado com validação melhorada
  const filteredData = data.filter(item => {
    if (!item?.Data_Entrada) return false;
    const entryDate = parseDate(item.Data_Entrada);
    if (!entryDate) return false;
    
    return (
      entryDate.getMonth() + 1 === period.month &&
      entryDate.getFullYear() === period.year
    );
  });

  // Agrupa os dados por status
  const statusGroups = _.groupBy(filteredData, 'Status');
  const statusCounts = _.mapValues(statusGroups, group => group.length);

  // Agrupa os dados por setor
  const setorGroups = _.groupBy(filteredData, 'Setor');
  const setorCounts = _.mapValues(setorGroups, group => group.length);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resumo dos Dados - {period.month}/{period.year}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Quantidade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(statusCounts).map(([status, count]) => (
                      <TableRow key={status}>
                        <TableCell>{status}</TableCell>
                        <TableCell>{count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Por Setor</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Setor</TableHead>
                      <TableHead>Quantidade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(setorCounts).map(([setor, count]) => (
                      <TableRow key={setor}>
                        <TableCell>{setor}</TableCell>
                        <TableCell>{count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados Detalhados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Entrada</TableHead>
                  <TableHead>Data Saída</TableHead>
                  <TableHead>Hospital</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.Nome}</TableCell>
                    <TableCell>{item.Setor}</TableCell>
                    <TableCell>{item.Status}</TableCell>
                    <TableCell>{item.Data_Entrada}</TableCell>
                    <TableCell>{item.Data_Saida}</TableCell>
                    <TableCell>{item.Hospital}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataDisplay;