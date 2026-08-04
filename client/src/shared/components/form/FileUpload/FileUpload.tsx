import React from 'react';
import { Controller, useFormContext, type FieldValues } from 'react-hook-form';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import { Icon } from '../../../ui/icon';
import { formatFileSize, validateFileSize, validateFileType } from './FileUpload.utils';
import type { IFormFileUploadProps } from './FileUpload.types';

interface IPreviewItemProps {
  readonly file: File | string | { url: string; name?: string };
  readonly onRemove?: () => void;
  readonly showFileSize?: boolean;
}

/** Visual representation of a single selected file or existing image attachment. */
const PreviewItem = ({ file, onRemove, showFileSize = true }: IPreviewItemProps) => {
  const [previewUrl, setPreviewUrl] = React.useState<string>('');

  React.useEffect(() => {
    if (file instanceof File) {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => {
          URL.revokeObjectURL(url);
        };
      }
    } else if (typeof file === 'string') {
      setPreviewUrl(file);
    } else if (file && typeof file === 'object' && 'url' in file) {
      setPreviewUrl(file.url);
    }
    return undefined;
  }, [file]);

  const fileName =
    file instanceof File
      ? file.name
      : typeof file === 'string'
        ? file.split('/').pop() ?? 'File'
        : file.name ?? 'File';

  const fileSize = file instanceof File ? formatFileSize(file.size) : '';

  return (
    <Paper
      elevation={1}
      sx={{
        p: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {previewUrl ? (
        <Box
          component="img"
          src={previewUrl}
          alt={fileName}
          sx={{
            width: 40,
            height: 40,
            objectFit: 'cover',
            borderRadius: 1,
            backgroundColor: 'action.hover',
          }}
        />
      ) : (
        <Box
          sx={{
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            backgroundColor: 'action.hover',
            borderRadius: 1,
          }}
        >
          📄
        </Box>
      )}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
          {fileName}
        </Typography>
        {showFileSize && fileSize ? (
          <Typography variant="caption" color="text.secondary">
            {fileSize}
          </Typography>
        ) : null}
      </Box>
      {onRemove !== undefined ? (
        <IconButton
          size="small"
          onClick={onRemove}
          aria-label={`Remove file ${fileName}`}
        >
          <Icon name="close" size="xs" />
        </IconButton>
      ) : null}
    </Paper>
  );
};

/**
 * Enterprise Form FileUpload Component (Module 9 - Step 9.11).
 *
 * Integrates hidden native file input and custom select buttons with RHF Controller.
 * Handles validation limits (counts, file types, and size limits) and displays previews.
 */
const FileUploadInner = <TFieldValues extends FieldValues = FieldValues>(
  props: IFormFileUploadProps<TFieldValues>,
  ref: React.Ref<unknown>
): React.ReactElement => {
  void ref;
  const {
    name,
    control,
    defaultValue,
    label,
    helperText,
    required = false,
    disabled = false,
    multiple = false,
    accept,
    maxFiles,
    maxFileSize,
    showPreview = true,
    showFileSize = true,
    allowRemove = true,
  } = props;

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const formContext = useFormContext();
  const setError = formContext?.setError;
  const clearErrors = formContext?.clearErrors;

  const handleButtonClick = (): void => {
    if (fileInputRef.current !== null) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    currentValue: unknown,
    onChangeCallback: (val: unknown) => void
  ): void => {
    const selectedFiles = e.target.files;
    if (selectedFiles === null || selectedFiles.length === 0) return;

    if (clearErrors !== undefined) {
      clearErrors(name);
    }

    const fileList = Array.from(selectedFiles);
    const validFiles: File[] = [];

    for (const file of fileList) {
      // 1. Validate File Size
      if (maxFileSize !== undefined && !validateFileSize(file, maxFileSize)) {
        if (setError !== undefined) {
          setError(name, {
            type: 'manual',
            message: `File "${file.name}" exceeds maximum size of ${formatFileSize(maxFileSize)}`,
          });
        }
        return;
      }

      // 2. Validate File Type (accept)
      if (accept !== undefined && !validateFileType(file, accept)) {
        if (setError !== undefined) {
          setError(name, {
            type: 'manual',
            message: `File "${file.name}" has an unaccepted type pattern (${accept})`,
          });
        }
        return;
      }

      validFiles.push(file);
    }

    if (multiple) {
      const existingFiles = Array.isArray(currentValue) ? currentValue : [];
      if (maxFiles !== undefined && existingFiles.length + validFiles.length > maxFiles) {
        if (setError !== undefined) {
          setError(name, {
            type: 'manual',
            message: `Maximum of ${maxFiles} files allowed`,
          });
        }
        return;
      }
      onChangeCallback([...existingFiles, ...validFiles]);
    } else {
      onChangeCallback(validFiles[0]);
    }

    // Reset input value to allow choosing the same file subsequently
    e.target.value = '';
  };

  const handleRemoveFile = (
    index: number,
    currentValue: unknown,
    onChangeCallback: (val: unknown) => void
  ): void => {
    if (clearErrors !== undefined) {
      clearErrors(name);
    }

    if (multiple && Array.isArray(currentValue)) {
      const updated = currentValue.filter((_, i) => i !== index);
      onChangeCallback(updated.length > 0 ? updated : null);
    } else {
      onChangeCallback(null);
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      {...(defaultValue !== undefined ? { defaultValue } : {})}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => {
        const hasError = error !== undefined;
        const resolvedHelperText = hasError ? error.message : helperText;

        const filesArray = multiple
          ? Array.isArray(value)
            ? value
            : value
              ? [value]
              : []
          : value
            ? [value]
            : [];

        return (
          <FormControl
            error={hasError}
            required={required}
            disabled={disabled}
            fullWidth
          >
            {label !== undefined ? (
              <Typography
                variant="subtitle2"
                gutterBottom
                color={hasError ? 'error' : 'text.primary'}
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                {label}
                {required ? (
                  <Box component="span" color="error.main">
                    *
                  </Box>
                ) : null}
              </Typography>
            ) : null}

            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              multiple={multiple}
              onChange={(e) => {
                handleFileChange(e, value, onChange);
              }}
              onBlur={onBlur}
              disabled={disabled}
              {...(accept !== undefined ? { accept } : {})}
            />

            <Stack spacing={1.5} sx={{ width: '100%' }}>
              <Box>
                <Button
                  variant="outlined"
                  onClick={handleButtonClick}
                  disabled={disabled}
                  aria-describedby={
                    resolvedHelperText !== undefined ? `${name}-helper` : undefined
                  }
                >
                  Choose {multiple ? 'Files' : 'File'}
                </Button>
              </Box>

              {showPreview && filesArray.length > 0 ? (
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {filesArray.map((fileItem, idx) => {
                    const isFileInstance =
                      fileItem && typeof fileItem === 'object' && (fileItem as File) instanceof File;

                    return (
                      <PreviewItem
                        key={isFileInstance ? (fileItem as File).name + idx : idx}
                        file={fileItem as File | string}
                        showFileSize={showFileSize}
                        {...(allowRemove && !disabled
                          ? {
                              onRemove: () => {
                                handleRemoveFile(idx, value, onChange);
                              },
                            }
                          : {})}
                      />
                    );
                  })}
                </Stack>
              ) : null}

              {resolvedHelperText !== undefined ? (
                <FormHelperText id={`${name}-helper`} sx={{ mx: 0 }}>
                  {resolvedHelperText}
                </FormHelperText>
              ) : null}
            </Stack>
          </FormControl>
        );
      }}
    />
  );
};

const FileUpload = React.forwardRef(FileUploadInner) as <
  TFieldValues extends FieldValues = FieldValues
>(
  props: IFormFileUploadProps<TFieldValues> & { ref?: React.Ref<unknown> }
) => React.ReactElement;

(FileUpload as { displayName?: string }).displayName = 'FileUpload';

export default FileUpload;
export { FileUpload };
