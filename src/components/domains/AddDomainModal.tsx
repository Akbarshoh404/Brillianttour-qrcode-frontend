import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useCreateDomain } from "@/hooks/useDomains";
import { getApiErrorMessage } from "@/services/api";

interface AddDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (domainId: number) => void;
}

interface FormValues {
  name: string;
  baseUrl: string;
}

export function AddDomainModal({ isOpen, onClose, onCreated }: AddDomainModalProps) {
  const { showToast } = useToast();
  const createDomain = useCreateDomain();

  const { register, handleSubmit, reset } = useForm<FormValues>({ defaultValues: { name: "", baseUrl: "" } });

  const close = () => {
    reset();
    onClose();
  };

  const onSubmit = handleSubmit(async ({ name, baseUrl }) => {
    try {
      const domain = await createDomain.mutateAsync({ name, baseUrl });
      showToast(`"${domain.name}" added.`, "success");
      onCreated?.(domain.id!);
      close();
    } catch (error) {
      showToast(getApiErrorMessage(error), "error");
    }
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Add a domain"
      description="Documents can be deployed under this domain — it's what gets encoded in their QR code."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">Label</label>
          <input
            {...register("name", { required: true })}
            type="text"
            placeholder="e.g. Kapital Bank"
            autoFocus
            className="w-full rounded-xl border border-black/[0.06] bg-black/[0.03] px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-gray-100"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">Domain</label>
          <input
            {...register("baseUrl", { required: true })}
            type="text"
            placeholder="kapitalbank-docs.uz"
            className="w-full rounded-xl border border-black/[0.06] bg-black/[0.03] px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-gray-100"
          />
          <p className="mt-1.5 text-[11px] text-gray-400">
            Make sure this domain's DNS actually points at your backend server first — adding it here doesn't set
            that up for you.
          </p>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={close} disabled={createDomain.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={createDomain.isPending}>
            Add domain
          </Button>
        </div>
      </form>
    </Modal>
  );
}
