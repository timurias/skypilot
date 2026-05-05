'use client';

import * as React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { PlusCircle, Save, Trash2, Cpu, RefreshCcw } from 'lucide-react';
import Image from 'next/image';

import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import type { UAVConfiguration, UAVType } from '@/lib/types';
import { availablePayloads, uavTypes, controlAlgorithms } from '@/lib/data';
import { useAppContext } from '@/context/app-context';

const formSchema = z.object({
  name: z.string().min(3, 'Название должно содержать минимум 3 символа.'),
  type: z.enum(['MT', 'ST', 'SVVP'], { required_error: 'Пожалуйста, выберите тип БПЛА.' }),
  mass: z.coerce.number().positive('Масса должна быть положительным числом.'),
  dimensions: z.string().min(1, 'Укажите габариты.'),
  motorParams: z.string().min(1, 'Укажите параметры двигателей.'),
  payloads: z.array(z.string()).min(1, 'Выберите хотя бы одну нагрузку.'),
  algorithmId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditorPage() {
  const { configs, setConfigs, selectedConfigId, setSelectedConfigId, resetAll } = useAppContext();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: 'MT',
      mass: 0,
      dimensions: '',
      motorParams: '',
      payloads: [],
      algorithmId: '',
    },
  });

  const selectedType = form.watch('type');

  React.useEffect(() => {
    const config = configs.find(c => c.id === selectedConfigId);
    if (config) {
      form.reset({
        ...config,
        algorithmId: config.algorithmId || '',
      });
    } else {
      form.reset({
        name: '', type: 'MT', mass: 0, dimensions: '', motorParams: '', payloads: [], algorithmId: ''
      });
    }
  }, [selectedConfigId, configs, form]);

  const onSubmit = (values: FormValues) => {
    const newConfig: UAVConfiguration = { 
      ...values, 
      id: selectedConfigId || `config-${Date.now()}`,
      payloads: values.payloads as any
    };
    if (selectedConfigId && configs.some(c => c.id === selectedConfigId)) {
        setConfigs(configs.map(c => c.id === selectedConfigId ? newConfig : c));
    } else {
        setConfigs([...configs, newConfig]);
        setSelectedConfigId(newConfig.id);
    }
  };

  const handleAddNew = () => {
    setSelectedConfigId(null);
    form.reset({
        name: 'Новый БПЛА', type: 'MT', mass: 1, dimensions: '', motorParams: '', payloads: [], algorithmId: ''
    });
  };

  const handleDelete = (id: string) => {
    const newConfigs = configs.filter(c => c.id !== id);
    setConfigs(newConfigs);
    if (selectedConfigId === id) {
        setSelectedConfigId(newConfigs.length > 0 ? newConfigs[0].id : null);
    }
  };
  
  const getUAVGif = (type: UAVType | undefined) => {
    switch (type) {
      case 'MT': return '/mt.gif';
      case 'ST': return '/st.gif';
      case 'SVVP': return '/svvp.gif';
      default: return null;
    }
  };
  const uavGifUrl = getUAVGif(selectedType);
  const currentAlgorithms = selectedType ? controlAlgorithms[selectedType] : [];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Редактор моделей БПЛА"
          description="Выбирайте типы БПЛА, настраивайте параметры и алгоритмы управления."
        />
        <Button variant="outline" size="sm" onClick={resetAll} className="gap-2">
           <RefreshCcw className="h-4 w-4" /> Обновить всё
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Конфигурация планера</CardTitle>
              <CardDescription>
                Основные физические параметры и состав оборудования.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Название модели</FormLabel>
                            <FormControl>
                              <Input placeholder="Recon Drone Alpha" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Тип планера</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Выберите тип" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {uavTypes.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              {uavTypes.find(t => t.id === field.value)?.description}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name="mass"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Масса (кг)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dimensions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Габариты</FormLabel>
                            <FormControl>
                              <Input placeholder="550x550x300мм" {...field} />
                            </FormControl>
                             <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="payloads"
                            render={() => (
                            <FormItem>
                                <FormLabel>Полезная нагрузка</FormLabel>
                                <div className="space-y-2 mt-2">
                                {availablePayloads.map((item) => (
                                <FormField
                                    key={item.id}
                                    control={form.control}
                                    name="payloads"
                                    render={({ field }) => {
                                    return (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                            checked={field.value?.includes(item.id)}
                                            onCheckedChange={(checked) => {
                                                return checked
                                                ? field.onChange([...(field.value || []), item.id])
                                                : field.onChange(field.value?.filter((v) => v !== item.id));
                                            }}
                                            />
                                        </FormControl>
                                        <FormLabel className="font-normal text-xs">{item.name}</FormLabel>
                                        </FormItem>
                                    );
                                    }}
                                />
                                ))}
                                </div>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         {uavGifUrl && (
                            <div className="space-y-2">
                                <Label className="text-xs">Визуализация типа</Label>
                                <div className="aspect-video w-full overflow-hidden rounded-lg border bg-black flex items-center justify-center">
                                    <img
                                        src={uavGifUrl}
                                        alt="UAV Animation"
                                        className="max-h-full object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/uav/400/300';
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Cpu className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Алгоритм Управления</h3>
                    </div>
                    <CardDescription>Выберите базовый или нейросетевой алгоритм для различных условий полета.</CardDescription>
                    
                    <FormField
                      control={form.control}
                      name="algorithmId"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                              {currentAlgorithms.map((algo) => (
                                <FormItem key={algo.id}>
                                  <FormControl>
                                    <RadioGroupItem value={algo.id} className="peer sr-only" />
                                  </FormControl>
                                  <FormLabel className="flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-full">
                                    <div className="flex items-center justify-between w-full mb-1">
                                        <span className="font-bold">{algo.name}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase ${algo.category === 'neural' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-muted text-muted-foreground'}`}>
                                            {algo.category === 'neural' ? 'НС' : 'Классика'}
                                        </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{algo.description}</span>
                                  </FormLabel>
                                </FormItem>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full md:w-auto">
                    <Save className="mr-2 h-4 w-4" /> Сохранить БПЛА
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Список флота</CardTitle>
              <CardDescription>Ваши сохраненные конфигурации.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button variant="outline" className="w-full mb-4" onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4"/> Добавить новую
                </Button>
                <Separator className="mb-4"/>
                <div className="space-y-2">
                    {configs.map(config => (
                        <div 
                            key={config.id} 
                            onClick={() => setSelectedConfigId(config.id)}
                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selectedConfigId === config.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
                        >
                            <div className="flex flex-col">
                                <span className="font-medium text-sm">{config.name}</span>
                                <span className="text-[10px] text-muted-foreground">{config.type} | {config.mass}кг</span>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={(e) => {e.stopPropagation(); handleDelete(config.id);}}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
