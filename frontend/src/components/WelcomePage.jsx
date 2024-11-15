import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { BarChart, FileSpreadsheet, Calendar, FileText } from 'lucide-react';

const WelcomePage = () => {
  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">Sistema de Indicadores NIR</h1>
        <p className="text-xl text-gray-600">
          Núcleo Interno de Regulação - UPA Padre Roberto
        </p>
      </div>

      {/* Objetivo */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Objetivo</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-700 leading-relaxed">
          <p>
            O Sistema de Indicadores NIR foi desenvolvido para otimizar o monitoramento e análise 
            dos dados de atendimento da UPA Padre Roberto. Nossa missão é fornecer insights 
            precisos e atualizados para melhorar continuamente a qualidade do atendimento e 
            a gestão dos recursos hospitalares.
          </p>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <FileSpreadsheet className="h-12 w-12 mx-auto text-primary mb-4" />
            <h3 className="font-semibold mb-2">Relatórios Detalhados</h3>
            <p className="text-sm text-gray-600">
              Geração de relatórios completos com métricas importantes
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <Calendar className="h-12 w-12 mx-auto text-primary mb-4" />
            <h3 className="font-semibold mb-2">Calendário Integrado</h3>
            <p className="text-sm text-gray-600">
              Planeje e monitore eventos e atendimentos facilmente
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 mx-auto text-primary mb-4" />
            <h3 className="font-semibold mb-2">Documentação Completa</h3>
            <p className="text-sm text-gray-600">
              Acesse a documentação completa para utilizar todas as funcionalidades
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Como Começar */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Como Começar</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-3 text-gray-700">
            <li>Faça o upload do arquivo de dados (Excel ou PDF)</li>
            <li>Selecione o período desejado para análise</li>
            <li>Escolha entre visualizar o Dashboard ou gerar um Relatório completo</li>
            <li>Explore os diferentes indicadores e métricas disponíveis</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomePage; 