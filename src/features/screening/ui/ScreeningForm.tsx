import {
  Button,
  Group,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Stepper,
  Switch,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  DEFAULT_FIELD_UNIT_SYSTEM_MAP,
  PREDICTION_MODE_OPTIONS,
  SCREENING_STEP_FIELDS,
  type ConvertibleNumericField,
  type PredictionModel,
  type ScreeningFormValues,
  type UnitSystem,
} from '../model/types'
import {
  buildScreeningPayload,
  validateFieldValue,
  validateScreeningValues,
} from '../lib/validation'
import { useCreatePrediction } from '../hooks/useCreatePrediction'
import {
  convertSingleFormFieldUnit,
  getFieldUnitLabel,
  getFieldUnitLabelByMap,
  isConvertibleField,
} from '../lib/unitConverter'
import { getBloodReferenceHint } from '../model/bloodReferenceHints'

interface NumericFieldConfig {
  name: keyof ScreeningFormValues
  label: string
  min?: number
  max?: number
  integer?: boolean
}

const STEP_1_NUMERIC_FIELDS: NumericFieldConfig[] = [
  { name: 'RIDAGEYR', label: 'Возраст', min: 18, max: 80, integer: true },
  { name: 'BMXHT', label: 'Рост', min: 140, max: 220 },
  { name: 'weight_kg', label: 'Вес' },
  { name: 'BMXWAIST', label: 'Окружность талии', min: 50, max: 180 },
]

const STEP_2_FIELDS: NumericFieldConfig[] = [
  { name: 'LBXGLU', label: 'Глюкоза натощак', min: 50, max: 700 },
  { name: 'LBXTC', label: 'Общий холестерин', min: 50, max: 600 },
  { name: 'LBDHDD', label: 'ЛПВП-холестерин (HDL)', min: 10, max: 150 },
  { name: 'LBXTR', label: 'Триглицериды', min: 20, max: 2000 },
  { name: 'LBXSAT', label: 'АЛТ', min: 1, max: 500 },
  { name: 'LBXSASS', label: 'АСТ', min: 1, max: 500 },
  { name: 'LBXSUA', label: 'Мочевая кислота', min: 1, max: 20 },
  { name: 'LBXSCR', label: 'Креатинин', min: 0.3, max: 15 },
  { name: 'LBXSBU', label: 'Мочевина (BUN)', min: 2, max: 150 },
  { name: 'LBXSAL', label: 'Альбумин', min: 1, max: 7 },
  { name: 'LBXSAPSI', label: 'Щелочная фосфатаза (ALP)', min: 10, max: 1000 },
  { name: 'LBXSTB', label: 'Общий билирубин', min: 0.1, max: 30 },
  { name: 'LBXCRP', label: 'С-реактивный белок (СРБ)', min: 0, max: 30 },
  { name: 'LBXVIDMS', label: 'Витамин D (25-OH)', min: 5, max: 250 },
]

const STEP_3_FIELDS: NumericFieldConfig[] = [
  { name: 'LBXHGB', label: 'Гемоглобин', min: 5, max: 25 },
  { name: 'LBXRBCSI', label: 'Эритроциты (RBC)', min: 1, max: 8 },
  { name: 'LBXWBCSI', label: 'Лейкоциты (WBC)', min: 1, max: 50 },
  { name: 'LBXLYPCT', label: 'Процент лимфоцитов', min: 1, max: 80 },
  { name: 'LBXMCVSI', label: 'Средний объём эритроцита (MCV)', min: 50, max: 130 },
  { name: 'LBXRDW', label: 'Ширина распределения эритроцитов (RDW)', min: 10, max: 30 },
  { name: 'URXUMA', label: 'Микроальбумин мочи', min: 0, max: 3000 },
]

const GENDER_OPTIONS = [
  { value: '0', label: 'Мужской' },
  { value: '1', label: 'Женский' },
]

const HEALTH_STATUS_OPTIONS = [
  { value: '1', label: 'Отличное' },
  { value: '2', label: 'Очень хорошее' },
  { value: '3', label: 'Хорошее' },
  { value: '4', label: 'Удовлетворительное' },
  { value: '5', label: 'Плохое' },
]

const FAMILY_HISTORY_OPTIONS = [
  { value: '-1', label: 'Неизвестно' },
  { value: '0', label: 'Нет' },
  { value: '1', label: 'Да (родители или братья/сёстры)' },
]

const EDUCATION_OPTIONS = [
  { value: '1', label: 'Менее 9 классов' },
  { value: '2', label: '9-11 классов (без аттестата)' },
  { value: '3', label: 'Среднее общее (аттестат)' },
  { value: '4', label: 'Среднее специальное / неполное высшее' },
  { value: '5', label: 'Высшее и выше' },
]

const LAST_STEP_INDEX = 3
const REQUIRED_STEP_2_FIELDS: Array<keyof ScreeningFormValues> = ['LBXGLU', 'LBXTC', 'LBDHDD', 'LBXSCR']

export function ScreeningForm() {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [fieldUnitSystemMap, setFieldUnitSystemMap] = useState(DEFAULT_FIELD_UNIT_SYSTEM_MAP)
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false, false])
  const [selectedModel, setSelectedModel] = useState<PredictionModel | null>(null)
  const [modelError, setModelError] = useState<string | null>(null)
  const createPredictionMutation = useCreatePrediction()

  const form = useForm<ScreeningFormValues>({
    initialValues: {
      name: '',
      RIDAGEYR: '',
      RIAGENDR: '',
      BMXHT: '',
      weight_kg: '',
      BMXWAIST: '',
      hypertension: '0',
      HSD010: '',
      LBXGLU: '',
      LBXTC: '',
      LBDHDD: '',
      LBXTR: '',
      LBXSAT: '',
      LBXSASS: '',
      LBXSUA: '',
      LBXSCR: '',
      LBXSBU: '',
      LBXSAL: '',
      LBXSAPSI: '',
      LBXSTB: '',
      LBXCRP: '',
      LBXVIDMS: '',
      LBXHGB: '',
      LBXRBCSI: '',
      LBXWBCSI: '',
      LBXLYPCT: '',
      LBXMCVSI: '',
      LBXRDW: '',
      URXUMA: '',
      MCQ300C: '',
      MCQ160A: '0',
      MCQ160E: '0',
      MCQ160F: '0',
      DMDEDUC2: '',
    },
    validate: (values) => validateScreeningValues(values, fieldUnitSystemMap),
    validateInputOnBlur: true,
  })

  const handleFieldUnitChange = (field: ConvertibleNumericField, nextUnitSystem: UnitSystem) => {
    const currentUnitSystem = fieldUnitSystemMap[field]

    if (currentUnitSystem === nextUnitSystem) {
      return
    }

    const convertedValues = convertSingleFormFieldUnit(
      form.values,
      field,
      currentUnitSystem,
      nextUnitSystem,
    )

    form.setValues(convertedValues)
    form.setFieldError(field, null)

    setFieldUnitSystemMap((prev) => ({
      ...prev,
      [field]: nextUnitSystem,
    }))
  }

  const renderNumberInput = (field: NumericFieldConfig, required = false) => {
    const unitLabel = getFieldUnitLabelByMap(field.name, fieldUnitSystemMap)
    const convertibleField = isConvertibleField(field.name) ? field.name : null
    const hasLocalUnitSelector = convertibleField !== null
    const siUnitLabel = convertibleField ? getFieldUnitLabel(convertibleField, 'SI') : undefined
    const usUnitLabel = convertibleField ? getFieldUnitLabel(convertibleField, 'US') : undefined
    const localUnitSelector = convertibleField ? (
      <Select
        size="xs"
        aria-label={`Единица для ${field.label}`}
        value={fieldUnitSystemMap[convertibleField]}
        allowDeselect={false}
        checkIconPosition="right"
        data={[
          { value: 'SI', label: siUnitLabel ?? 'SI' },
          { value: 'US', label: usUnitLabel ?? 'US' },
        ]}
        onChange={(value) => {
          if (!value) {
            return
          }

          handleFieldUnitChange(convertibleField, value as UnitSystem)
        }}
        styles={{
          input: { minHeight: 22, height: 22, fontSize: 10, paddingInline: 6 },
          section: { width: 14 },
          dropdown: { minWidth: 80 },
        }}
      />
    ) : null

    const bloodReferenceHint = getBloodReferenceHint(field.name, fieldUnitSystemMap, form.values.RIAGENDR)

    return (
      <NumberInput
        key={field.name}
        label={field.label}
        description={bloodReferenceHint ? `Норма: ${bloodReferenceHint}` : undefined}
        placeholder="Введите значение"
        withAsterisk={required}
        allowDecimal={!field.integer}
        decimalScale={field.integer ? 0 : undefined}
        rightSection={
          hasLocalUnitSelector ? (
            localUnitSelector
          ) : unitLabel ? (
            <Text size="xs" c="dimmed" truncate="end" style={{ maxWidth: '100%' }}>
              {unitLabel}
            </Text>
          ) : undefined
        }
        rightSectionWidth={hasLocalUnitSelector ? 92 : unitLabel ? 72 : undefined}
        rightSectionPointerEvents={hasLocalUnitSelector ? 'all' : 'none'}
        {...form.getInputProps(field.name)}
      />
    )
  }

  const validateStep = (step: number) => {
    const fields = SCREENING_STEP_FIELDS[step]
    let hasErrors = false

    fields.forEach((fieldName) => {
      const error = validateFieldValue(fieldName, form.values[fieldName], fieldUnitSystemMap)
      form.setFieldError(fieldName, error)

      if (error) {
        hasErrors = true
      }
    })

    return !hasErrors
  }

  const validateStepRules = () => {
    return true
  }

  const handleNextStep = () => {
    const isStepValid = validateStep(activeStep)

    if (!isStepValid) {
      return
    }

    if (!validateStepRules()) {
      return
    }

    setCompletedSteps((prev) => prev.map((item, index) => (index === activeStep ? true : item)))
    setActiveStep((prev) => Math.min(prev + 1, LAST_STEP_INDEX))
  }

  const handlePrevStep = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSubmit = async (values: ScreeningFormValues) => {
    let invalidStepIndex: number | null = null

    for (let stepIndex = 0; stepIndex <= LAST_STEP_INDEX; stepIndex += 1) {
      const isStepValid = validateStep(stepIndex)
      const isStepRulesValid = validateStepRules()

      if (!isStepValid || !isStepRulesValid) {
        invalidStepIndex = stepIndex
        break
      }
    }

    if (invalidStepIndex !== null) {
      setActiveStep(invalidStepIndex)
      return
    }

    if (!selectedModel) {
      setModelError('Выберите модель')
      setActiveStep(LAST_STEP_INDEX)
      return
    }

    setCompletedSteps([true, true, true, true])
    const payload = buildScreeningPayload(values)

    try {
      const response = await createPredictionMutation.mutateAsync({
        name: values.name.trim(),
        payload,
        fieldUnitSystemMap,
        model: selectedModel,
      })

      if (response.id) {
        navigate(`/predictions/${response.id}`)
        return
      }

      navigate('/predictions')
    } catch {
      // Ошибка обрабатывается в onError mutation-хука.
    }
  }

  return (
    <Paper withBorder shadow="sm" radius="lg" p="xl" className="w-full max-w-5xl bg-white">
      <Title order={2} ta="center" c="blue.8" mb="xs">
        Форма скрининга уровня сахара
      </Title>
      <Text ta="center" c="dimmed" size="sm" mb="lg">
        Вычисляемые поля (ИМТ, eGFR и производные метрики) считаются на бэкенде и не выводятся в форму.
      </Text>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          <Stepper active={activeStep} onStepClick={setActiveStep} allowNextStepsSelect={false}>
            <Stepper.Step label="Шаг 1" description="Обязательные">
              <Stack mt="md" gap="md">
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                  {STEP_1_NUMERIC_FIELDS.map((field) => renderNumberInput(field, true))}
                </SimpleGrid>

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <Select
                    label="Пол"
                    placeholder="Выберите значение"
                    withAsterisk
                    allowDeselect={false}
                    data={GENDER_OPTIONS}
                    {...form.getInputProps('RIAGENDR')}
                  />
                  <Select
                    label="Самооценка состояния здоровья"
                    placeholder="Опционально"
                    clearable
                    data={HEALTH_STATUS_OPTIONS}
                    value={form.values.HSD010 === '' ? null : String(form.values.HSD010)}
                    onChange={(value) =>
                      form.setFieldValue('HSD010', value === null ? '' : Number(value))
                    }
                    onBlur={() => form.validateField('HSD010')}
                    error={form.errors.HSD010}
                  />
                </SimpleGrid>
                <Switch
                  label={`Артериальная гипертензия: ${
                    form.values.hypertension === '1' ? 'Да' : 'Нет'
                  }`}
                  checked={form.values.hypertension === '1'}
                  onChange={(event) =>
                    form.setFieldValue('hypertension', event.currentTarget.checked ? '1' : '0')
                  }
                />
              </Stack>
            </Stepper.Step>

            <Stepper.Step label="Шаг 2" description="Биохимия">
              <Stack mt="md" gap="md">
                <Text size="sm" c="dimmed">
                  Поля со звездочкой обязательны, остальные уйдут в payload как null.
                </Text>
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                  {STEP_2_FIELDS.map((field) =>
                    renderNumberInput(field, REQUIRED_STEP_2_FIELDS.includes(field.name)),
                  )}
                </SimpleGrid>
              </Stack>
            </Stepper.Step>

            <Stepper.Step label="Шаг 3" description="Общий анализ">
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md" mt="md">
                {STEP_3_FIELDS.map((field) => renderNumberInput(field))}
              </SimpleGrid>
            </Stepper.Step>

            <Stepper.Step label="Шаг 4" description="Факторы риска">
              <Stack mt="md" gap="md">
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                  <TextInput
                    label="Название предсказания"
                    placeholder="Например: Скрининг апрель"
                    withAsterisk
                    {...form.getInputProps('name')}
                  />
                  <Select
                    label="Семейный анамнез сахарного диабета"
                    placeholder="Выберите значение"
                    withAsterisk
                    allowDeselect={false}
                    data={FAMILY_HISTORY_OPTIONS}
                    {...form.getInputProps('MCQ300C')}
                  />
                  <Select
                    label="Уровень образования"
                    placeholder="Выберите значение"
                    withAsterisk
                    allowDeselect={false}
                    data={EDUCATION_OPTIONS}
                    value={form.values.DMDEDUC2 === '' ? null : String(form.values.DMDEDUC2)}
                    onChange={(value) =>
                      form.setFieldValue('DMDEDUC2', value === null ? '' : Number(value))
                    }
                    onBlur={() => form.validateField('DMDEDUC2')}
                    error={form.errors.DMDEDUC2}
                  />
                  <Select
                    label="Модель прогнозирования"
                    placeholder="Выберите модель"
                    withAsterisk
                    allowDeselect={false}
                    data={PREDICTION_MODE_OPTIONS.map((option) => ({
                      value: option.value,
                      label: option.label,
                    }))}
                    value={selectedModel}
                    onChange={(value) => {
                      if (!value) {
                        return
                      }

                      setSelectedModel(value as PredictionModel)
                      setModelError(null)
                    }}
                    error={modelError}
                  />
                  {selectedModel ? (
                    <>
                      <Text size="sm" c="dimmed">
                        {
                          PREDICTION_MODE_OPTIONS.find((option) => option.value === selectedModel)
                            ?.description
                        }
                      </Text>
                      <Text size="xs" c="dimmed">
                        Метрики: {' '}
                        {
                          PREDICTION_MODE_OPTIONS.find((option) => option.value === selectedModel)
                            ?.metrics.join(', ')
                        }
                      </Text>
                    </>
                  ) : null}
                </SimpleGrid>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <Switch
                    label={`Инфаркт миокарда в анамнезе: ${
                      form.values.MCQ160A === '1' ? 'Да' : 'Нет'
                    }`}
                    checked={form.values.MCQ160A === '1'}
                    onChange={(event) =>
                      form.setFieldValue('MCQ160A', event.currentTarget.checked ? '1' : '0')
                    }
                  />
                  <Switch
                    label={`Инсульт в анамнезе: ${form.values.MCQ160E === '1' ? 'Да' : 'Нет'}`}
                    checked={form.values.MCQ160E === '1'}
                    onChange={(event) =>
                      form.setFieldValue('MCQ160E', event.currentTarget.checked ? '1' : '0')
                    }
                  />
                  <Switch
                    label={`Хроническая сердечная недостаточность: ${
                      form.values.MCQ160F === '1' ? 'Да' : 'Нет'
                    }`}
                    checked={form.values.MCQ160F === '1'}
                    onChange={(event) =>
                      form.setFieldValue('MCQ160F', event.currentTarget.checked ? '1' : '0')
                    }
                  />
                </SimpleGrid>
              </Stack>
            </Stepper.Step>
          </Stepper>

          <Group justify="space-between">
            <Button variant="default" onClick={handlePrevStep} disabled={activeStep === 0}>
              Назад
            </Button>

            {activeStep < LAST_STEP_INDEX ? (
              <Button type="button" onClick={handleNextStep} disabled={createPredictionMutation.isPending}>
                Далее
              </Button>
            ) : (
              <Button
                type="submit"
                color="blue"
                loading={createPredictionMutation.isPending}
                disabled={!completedSteps.slice(0, LAST_STEP_INDEX).every(Boolean)}
              >
                Отправить на сервер
              </Button>
            )}
          </Group>
        </Stack>
      </form>
    </Paper>
  )
}
