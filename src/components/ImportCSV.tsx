import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { importTradeLogs, Symbol } from '@/utils/importTradeLogs';
import { Upload, CheckCircle2, Loader2 } from 'lucide-react';

export const ImportCSV = ({ onImportSuccess }: { onImportSuccess?: () => void }) => {
  const [loadingM2K, setLoadingM2K] = useState(false);
  const [loadingMES, setLoadingMES] = useState(false);
  const [loadingMNQ, setLoadingMNQ] = useState(false);
  const [importedM2K, setImportedM2K] = useState(false);
  const [importedMES, setImportedMES] = useState(false);
  const [importedMNQ, setImportedMNQ] = useState(false);
  const { toast } = useToast();

  const handleImport = async (symbol: Symbol) => {
    const setLoading = symbol === 'M2K' ? setLoadingM2K : symbol === 'MES' ? setLoadingMES : setLoadingMNQ;
    const setImported = symbol === 'M2K' ? setImportedM2K : symbol === 'MES' ? setImportedMES : setImportedMNQ;
    
    setLoading(true);
    try {
      // Fetch the CSV file for the specific symbol
      const fileName = symbol === 'M2K' ? 'm2k.csv' : symbol === 'MES' ? 'mes.csv' : 'mnq.csv';
      const response = await fetch(`/${fileName}`);
      
      if (!response.ok) {
        throw new Error(`CSV file not found: ${fileName}`);
      }
      
      const csvContent = await response.text();
      const result = await importTradeLogs(csvContent, symbol);
      
      if (result.success) {
        setImported(true);
        toast({
          title: `${symbol} - Success!`,
          description: `Imported ${result.count} trade logs successfully.`,
        });
        
        // Reload data after successful import
        if (onImportSuccess) {
          setTimeout(() => onImportSuccess(), 1000);
        }
      } else {
        throw new Error('Import failed');
      }
    } catch (error: any) {
      toast({
        title: `${symbol} - Error`,
        description: error.message || 'Failed to import trade logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const ImportButton = ({ symbol, loading, imported }: { symbol: Symbol; loading: boolean; imported: boolean }) => (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm">{symbol}</h3>
      {!imported ? (
        <Button 
          onClick={() => handleImport(symbol)} 
          disabled={loading}
          className="w-full"
          variant="outline"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Import {symbol}
            </>
          )}
        </Button>
      ) : (
        <div className="flex items-center justify-center text-success py-2">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          <span className="text-sm font-medium">Imported!</span>
        </div>
      )}
    </div>
  );

  return (
    <Card className="w-full max-w-2xl flex-1">
      <CardHeader>
        <CardTitle>Import Trade Logs</CardTitle>
        <CardDescription>
          Import historical trade data from CSV files for each symbol
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-6">
          <ImportButton symbol="M2K" loading={loadingM2K} imported={importedM2K} />
          <ImportButton symbol="MES" loading={loadingMES} imported={importedMES} />
          <ImportButton symbol="MNQ" loading={loadingMNQ} imported={importedMNQ} />
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Place CSV files in public folder as: m2k.csv, mes.csv, mnq.csv
        </p>
      </CardContent>
    </Card>
  );
};

