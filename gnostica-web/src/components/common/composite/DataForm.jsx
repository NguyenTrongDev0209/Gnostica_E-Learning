import React from 'react';
import { useForm, useFormContext, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';

import AppInput, { AppPasswordInput, AppInputOTP, AppInputGroup } from '@/components/common/micro/AppInput';
import AppTextarea from '@/components/common/micro/AppTextarea';
import AppSelect from '@/components/common/micro/AppSelect';
import { AppCheckbox } from '@/components/common/micro/AppCheckbox';
import AppRadioGroup from '@/components/common/micro/AppRadioGroup';
import AppSwitch from '@/components/common/micro/AppSwitch';
import AppSlider from '@/components/common/micro/AppSlider';
import { AppDatePicker } from "@/components/common/composite/DataFilter";

/**
 * DataForm
 * 
 * Wrapper form tự động khởi tạo useForm với Zod.
 */
export function DataForm({
  form: externalForm,
  schema,
  defaultValues,
  onSubmit,
  className,
  children,
  ...props
}) {
  const internalForm = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues,
  });

  const form = externalForm || internalForm;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={className}
        {...props}
      >
        {children}
      </form>
    </Form>
  );
}

/**
 * DataFormField
 * 
 * Tự động chọn và mapping Micro Component dựa vào prop `type`
 */
export function DataFormField({
  name,
  type = 'text',
  label,
  description,
  options,
  placeholder,
  disabled,
  className,
  appVariant,
  ...props
}) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const errorMsg = fieldState.error?.message;

        const commonProps = {
          id: name,
          label,
          description,
          error: errorMsg,
          disabled,
          className,
          appVariant,
          ...props,
        };

        switch (type) {
          case 'password':
            return <AppPasswordInput {...field} placeholder={placeholder} {...commonProps} />;
          case 'textarea':
            return <AppTextarea {...field} placeholder={placeholder} {...commonProps} />;
          case 'select':
            return <AppSelect value={field.value} onChange={field.onChange} options={options} placeholder={placeholder} {...commonProps} />;
          case 'checkbox':
            return <AppCheckbox checked={field.value} onCheckedChange={field.onChange} {...commonProps} />;
          case 'radio':
            return <AppRadioGroup value={field.value} onValueChange={field.onChange} options={options} {...commonProps} />;
          case 'switch':
            return <AppSwitch checked={field.value} onCheckedChange={field.onChange} {...commonProps} />;
          case 'slider':
            return <AppSlider value={Array.isArray(field.value) ? field.value : [field.value || 0]} onValueChange={field.onChange} {...commonProps} />;
          case 'date':
            return <AppDatePicker date={field.value} onSelect={field.onChange} placeholder={placeholder} {...commonProps} />;
          case 'otp':
            return <AppInputOTP value={field.value} onChange={field.onChange} {...commonProps} />;
          case 'group':
            return <AppInputGroup {...field} placeholder={placeholder} {...commonProps} />;
          case 'text':
          case 'email':
          case 'number':
          default:
            return <AppInput {...field} type={type} placeholder={placeholder} {...commonProps} />;
        }
      }}
    />
  );
}
