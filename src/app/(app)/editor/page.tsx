'use client';

import * as React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { PlusCircle, Save, Trash2, Cpu, RefreshCcw, ChevronRight } from 'lucide-react';

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
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

import type { UAVConfiguration, UAVType } from '@/lib/types';
import { availablePayloads, uavTypes, controlAlgorithmsHierarchy } from '@/lib/data';
import { useAppContext } from '@/context/app-context';

const formSchema = z.object({
  name: z.string().min(3, 'Название должно содержать минимум 3 символа.'),
  type: z.enum(['MT', 'ST', 'SVVP'], { required_error: 'Пожалуйста, выберите тип БПЛА.' }),
  mass: z.coerce.number().positive('Масса должна быть положительным числом.'),
  dimensions: z.string().min(1, 'Укажите габариты.'),
  motorParams: z.string().min(1, 'Укажите параметры двигателей.'),
  payloads: z.array(z.string()).min(1, 'Выберите хотя бы одну нагрузку.'),
  algorithmIds: z.array(z.string()).default([]),
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
      algorithmIds: [],
    },
  });

  const selectedType = form.watch('type');

  React.useEffect(() => {
    const config = configs.find(c => c.id === selectedConfigId);
    if (config) {
      form.reset({
        ...config,
        algorithmIds: config.algorithmIds || [],
      });
    } else {
      form.reset({
        name: '', type: 'MT', mass: 0, dimensions: '', motorParams: '', payloads: [], algorithmIds: []
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
        name: 'Новый БПЛА', type: 'MT', mass: 1, dimensions: '', motorParams: '', payloads: [], algorithmIds: []
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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Платформа и функционал"
          description="Выбирайте типы БПЛА, настраивайте параметры и алгоритмы управления."
        />
        <Button variant="outline" size="sm" onClick={resetAll} className="gap-2">
           <RefreshCcw className="h-4 w-4" /> Обновить всё
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Конфигурация планера</CardTitle>
                  <CardDescription>
                    Основные физические параметры и состав оборудования.
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                      <Cpu className="h-5 w-5 text-primary" />
                      <CardTitle>Алгоритмы Управления</CardTitle>
                  </div>
                  <CardDescription>Выберите набор алгоритмов низкого и высокого уровня.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Низкоуровневое управление */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-sm text-primary uppercase flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" /> {controlAlgorithmsHierarchy.lowLevel.name}
                    </h3>
                    <div className="pl-6 space-y-6">
                      {/* Классические */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-muted-foreground">{controlAlgorithmsHierarchy.lowLevel.classical.name}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {controlAlgorithmsHierarchy.lowLevel.classical.items.map((algo) => (
                            <FormField
                              key={algo.id}
                              control={form.control}
                              name="algorithmIds"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 bg-card hover:bg-accent/50 cursor-pointer">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(algo.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, algo.id])
                                          : field.onChange(field.value?.filter((v) => v !== algo.id));
                                      }}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-xs font-medium cursor-pointer">{algo.name}</FormLabel>
                                    <p className="text-[10px] text-muted-foreground">{algo.description}</p>
                                  </div>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      {/* Нейросетевые */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-muted-foreground">{controlAlgorithmsHierarchy.lowLevel.neural.name}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {controlAlgorithmsHierarchy.lowLevel.neural.items.map((algo) => (
                            <FormField
                              key={algo.id}
                              control={form.control}
                              name="algorithmIds"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-primary/20 bg-primary/5 p-3 hover:bg-primary/10 cursor-pointer">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(algo.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, algo.id])
                                          : field.onChange(field.value?.filter((v) => v !== algo.id));
                                      }}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-xs font-medium cursor-pointer">{algo.name}</FormLabel>
                                    <p className="text-[10px] text-muted-foreground">{algo.description}</p>
                                  </div>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Высокоуровневое управление */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-sm text-primary uppercase flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" /> {controlAlgorithmsHierarchy.highLevel.name}
                    </h3>
                    <div className="pl-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                       {controlAlgorithmsHierarchy.highLevel.items.map((algo) => (
                        <FormField
                          key={algo.id}
                          control={form.control}
                          name="algorithmIds"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 bg-card hover:bg-accent/50 cursor-pointer">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(algo.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, algo.id])
                                      : field.onChange(field.value?.filter((v) => v !== algo.id));
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-xs font-medium cursor-pointer">{algo.name}</FormLabel>
                                <p className="text-[10px] text-muted-foreground">{algo.description}</p>
                              </div>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" className="w-full md:w-auto h-12">
                <Save className="mr-2 h-5 w-5" /> Сохранить БПЛА
              </Button>
            </form>
          </Form>
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
