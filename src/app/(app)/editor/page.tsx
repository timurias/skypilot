'use client';

import * as React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { PlusCircle, Save, Trash2 } from 'lucide-react';
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

import type { UAVConfiguration, UAVType } from '@/lib/types';
import { availablePayloads, initialUavConfigurations, uavTypes } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const formSchema = z.object({
  name: z.string().min(3, 'Название должно содержать минимум 3 символа.'),
  type: z.enum(['MT', 'ST', 'SVVP'], { required_error: 'Пожалуйста, выберите тип БПЛА.' }),
  mass: z.coerce.number().positive('Масса должна быть положительным числом.'),
  dimensions: z.string().min(1, 'Укажите габариты.'),
  motorParams: z.string().min(1, 'Укажите параметры двигателей.'),
  payloads: z.array(z.string()).min(1, 'Выберите хотя бы одну нагрузку.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditorPage() {
  const [configs, setConfigs] = React.useState<UAVConfiguration[]>(initialUavConfigurations);
  const [selectedConfigId, setSelectedConfigId] = React.useState<string | null>(configs[0]?.id ?? null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: undefined,
      mass: 0,
      dimensions: '',
      motorParams: '',
      payloads: [],
    },
  });

  const selectedType = form.watch('type');

  React.useEffect(() => {
    const config = configs.find(c => c.id === selectedConfigId);
    if (config) {
      form.reset(config);
    } else {
      form.reset({
        name: '', type: undefined, mass: 0, dimensions: '', motorParams: '', payloads: []
      });
    }
  }, [selectedConfigId, configs, form]);

  const onSubmit = (values: FormValues) => {
    const newConfig: UAVConfiguration = { ...values, id: selectedConfigId || `config-${Date.now()}` };
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
        name: 'Новый БПЛА', type: 'MT', mass: 1, dimensions: '', motorParams: '', payloads: []
    });
  };

  const handleDelete = (id: string) => {
    setConfigs(configs.filter(c => c.id !== id));
    if (selectedConfigId === id) {
        setSelectedConfigId(configs.length > 1 ? configs[0].id : null);
    }
  };
  
  const getUAVImage = (type: UAVType | undefined) => {
    switch (type) {
      case 'MT': return PlaceHolderImages.find(img => img.id === 'uav_multirotor');
      case 'ST': return PlaceHolderImages.find(img => img.id === 'uav_fixedwing');
      case 'SVVP': return PlaceHolderImages.find(img => img.id === 'uav_vtol');
      default: return undefined;
    }
  };
  const uavImage = getUAVImage(selectedType);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Редактор моделей БПЛА"
        description="Выбирайте из предопределенных типов БПЛА, настраивайте их параметры и определяйте состав полезной нагрузки."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Редактор конфигурации</CardTitle>
              <CardDescription>
                Измените существующую конфигурацию или создайте новую.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="space-y-8">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Название конфигурации</FormLabel>
                            <FormControl>
                              <Input placeholder="например, Recon Drone Alpha" {...field} />
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
                            <FormLabel>Тип БПЛА</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Выберите тип БПЛА" />
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
                              <Input type="number" step="0.1" placeholder="например, 2.5" {...field} />
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
                              <Input placeholder="например, 550x550x300мм" {...field} />
                            </FormControl>
                             <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name="motorParams"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Параметры двигателей</FormLabel>
                            <FormControl>
                              <Input placeholder="например, 2212 920KV" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="space-y-8">
                        <FormField
                            control={form.control}
                            name="payloads"
                            render={() => (
                            <FormItem>
                                <div className="mb-4">
                                <FormLabel>Полезная нагрузка</FormLabel>
                                <FormDescription>
                                    Выберите датчики, установленные на БПЛА.
                                </FormDescription>
                                </div>
                                {availablePayloads.map((item) => (
                                <FormField
                                    key={item.id}
                                    control={form.control}
                                    name="payloads"
                                    render={({ field }) => {
                                    return (
                                        <FormItem
                                        key={item.id}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                        >
                                        <FormControl>
                                            <Checkbox
                                            checked={field.value?.includes(item.id)}
                                            onCheckedChange={(checked) => {
                                                return checked
                                                ? field.onChange([...(field.value || []), item.id])
                                                : field.onChange(
                                                    field.value?.filter(
                                                        (value) => value !== item.id
                                                    )
                                                    );
                                            }}
                                            />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            {item.name}
                                        </FormLabel>
                                        </FormItem>
                                    );
                                    }}
                                />
                                ))}
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         {uavImage && (
                            <div className="space-y-2">
                                <Label>Предпросмотр БПЛА</Label>
                                <div className="aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                                    <Image
                                        src={uavImage.imageUrl}
                                        alt={uavImage.description}
                                        width={400}
                                        height={300}
                                        className="h-full w-full object-cover"
                                        data-ai-hint={uavImage.imageHint}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                  </div>
                  <Button type="submit">
                    <Save className="mr-2" /> Сохранить конфигурацию
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Сохраненные конфигурации</CardTitle>
              <CardDescription>Управление вашими моделями БПЛА.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button variant="outline" className="w-full mb-4" onClick={handleAddNew}>
                    <PlusCircle className="mr-2"/> Добавить конфигурацию
                </Button>
                <Separator/>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Название</TableHead>
                            <TableHead>Тип</TableHead>
                            <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {configs.map(config => (
                            <TableRow 
                                key={config.id} 
                                className="cursor-pointer"
                                data-state={selectedConfigId === config.id ? 'selected' : ''}
                                onClick={() => setSelectedConfigId(config.id)}
                            >
                                <TableCell className="font-medium">{config.name}</TableCell>
                                <TableCell>{config.type}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={(e) => {e.stopPropagation(); handleDelete(config.id);}}>
                                        <Trash2 className="h-4 w-4 text-destructive"/>
                                        <span className="sr-only">Удалить</span>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
