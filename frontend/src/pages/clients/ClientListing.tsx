import React, { Suspense, useEffect, useRef, useState } from "react";
import { Button, Card, Form, Row } from "react-bootstrap";
import { NAVIGATION_PATH } from "@/constants";
import { Client } from "@/types/api/Client";
import { ClientFilter } from "@/types/api/filters/ClientFilter";
import DataTable from "@/components/DataTable";
import { Link } from "react-router-dom";
import { HiOutlinePencilAlt, HiOutlineTrash } from "react-icons/hi";
import { HiOutlineUpload } from "react-icons/hi";
import Loader from "@/components/Loader";
import ClientService from "@/services/ClientService";
import { TextFormFieldType } from "@/components/form/TextFormField/TextFormFieldType";
import { format } from "@/helpers/format";
import CustomModal from "@/components/CustomModal";
import { toastr } from "@/utils/toastr";
import { errorHandling } from "@/utils/errorHandling";
import { useQueryClient } from "@tanstack/react-query";
import { ReactQueryKeys } from "@/constants/ReactQueryKeys";

const ACCEPTED_CSV = ".csv";
const MAX_FILE_SIZE_MB = 5;
const DELETE_CONFIRM_TEXT = "deletar";

const ClientListing = () => {
    const [date, setDate] = useState<Date>();
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [deleting, setDeleting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        setDate(new Date());
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            setSelectedFile(null);
            return;
        }
        if (!file.name.toLowerCase().endsWith(".csv")) {
            void toastr({ title: "Formato inválido", text: "Selecione um arquivo .csv", icon: "warning" });
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            void toastr({ title: "Arquivo grande", text: `O arquivo deve ter no máximo ${MAX_FILE_SIZE_MB} MB.`, icon: "warning" });
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }
        setSelectedFile(file);
    };

    const handleImportSubmit = async () => {
        if (!selectedFile) return;
        setImporting(true);
        try {
            const { jobId } = await ClientService.importCsv(selectedFile);
            setShowImportModal(false);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            void queryClient.invalidateQueries({ queryKey: [ReactQueryKeys.CLIENT] });
            void toastr({
                title: "Importação enviada",
                text: "O arquivo foi enviado e será processado em breve. ID do job: " + jobId,
                icon: "success",
            });
        } catch (err) {
            errorHandling(err);
        } finally {
            setImporting(false);
        }
    };

    const closeImportModal = () => {
        if (!importing) {
            setShowImportModal(false);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const openDeleteModal = (client: Client) => {
        setClientToDelete(client);
        setDeleteConfirmText("");
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        if (!deleting) {
            setShowDeleteModal(false);
            setClientToDelete(null);
            setDeleteConfirmText("");
        }
    };

    const handleDeleteConfirm = async () => {
        if (!clientToDelete?.id || deleteConfirmText.toLowerCase() !== DELETE_CONFIRM_TEXT) return;
        setDeleting(true);
        try {
            await ClientService.delete(clientToDelete.id);
            void toastr({ title: "Cliente excluído", text: "O cliente foi excluído com sucesso.", icon: "success" });
            closeDeleteModal();
            window.location.reload();
        } catch (err) {
            errorHandling(err);
        } finally {
            setDeleting(false);
        }
    };

    return <>
        <Row style={{ justifyContent: "end", margin: "10px 0", gap: 8 }}>
            <Button
                variant="outline-primary"
                style={{ maxWidth: "fit-content" }}
                onClick={() => setShowImportModal(true)}
            >
                <HiOutlineUpload style={{ marginRight: 6 }} />
                Importar em lote
            </Button>
            <Link to={NAVIGATION_PATH.CLIENTS.CREATE.ABSOLUTE}>
                <Button style={{ maxWidth: "fit-content" }}>Adicionar</Button>
            </Link>
        </Row>

        <CustomModal
            show={showImportModal}
            onHide={closeImportModal}
            header={{ title: "Importação em lote de clientes", closeButton: true }}
            footer={{
                actions: [
                    { label: "Cancelar", variant: "secondary", handler: closeImportModal, disabled: importing },
                    {
                        label: importing ? "Enviando..." : "Enviar",
                        variant: "primary",
                        disabled: !selectedFile || importing,
                        handler: handleImportSubmit,
                    },
                ],
            }}
        >
            <Form>
                <Form.Group className="mb-3">
                    <Form.Label>Arquivo CSV</Form.Label>
                    <Form.Control
                        ref={fileInputRef}
                        type="file"
                        accept={ACCEPTED_CSV}
                        onChange={handleFileChange}
                        disabled={importing}
                    />
                    {selectedFile && (
                        <Form.Text className="text-muted">
                            {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </Form.Text>
                    )}
                    <Form.Text className="text-muted">
                        Apenas arquivos .csv são aceitos. Tamanho máximo: {MAX_FILE_SIZE_MB} MB.
                    </Form.Text>
                </Form.Group>
            </Form>
        </CustomModal>

        <CustomModal
            show={showDeleteModal}
            onHide={closeDeleteModal}
            header={{ title: "Excluir cliente?", closeButton: true }}
            footer={{
                actions: [
                    { label: "Cancelar", variant: "secondary", handler: closeDeleteModal, disabled: deleting },
                    {
                        label: deleting ? "Excluindo..." : "Excluir",
                        variant: "danger",
                        disabled: deleteConfirmText.toLowerCase() !== DELETE_CONFIRM_TEXT || deleting,
                        handler: handleDeleteConfirm,
                    },
                ],
            }}
        >
            <p className="mb-3">
                Tem certeza que deseja excluir o cliente <strong>{clientToDelete ? `${clientToDelete.firstName} ${clientToDelete.lastName}` : ""}</strong>?
                Esta ação não pode ser desfeita.
            </p>
            <Form.Group>
                <Form.Label>Digite &quot;deletar&quot; para confirmar:</Form.Label>
                <Form.Control
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    onPaste={(e) => e.preventDefault()}
                    onCopy={(e) => e.preventDefault()}
                    placeholder="deletar"
                    disabled={deleting}
                    autoComplete="off"
                />
            </Form.Group>
        </CustomModal>

        <Card >
            <Card.Title></Card.Title>
            <Card.Header>
                <Card.Title>
                    Clientes
                </Card.Title>
            </Card.Header>
            <Suspense fallback={<><Loader /><br /><br /></>}>
                <DataTable<Client, ClientFilter>
                    thin
                    columns={[
                        { Header: "Nome", accessor: "firstName" },
                        { Header: "Sobrenome", accessor: "lastName" },
                        { Header: "Email", accessor: "email" },
                        {
                            Header: "Telefone",
                            accessor: "phoneNumber",
                            Cell: ({ value }) => format.toPhone(value),
                        },
                        {
                            Header: "Documento",
                            accessor: "documentNumber",
                            Cell: ({ value }) => format.toDocument(value),
                        },
                        {
                            Header: "Data de nascimento",
                            accessor: "birthDate",
                            Cell: ({ value }) => format.toBirthDateDisplay(value),
                        },
                        {
                            Header: "Ações",
                            id: "actions",
                            Cell: ({ row }) =>
                                row.original.id ? (
                                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <Link
                                            to={`${NAVIGATION_PATH.CLIENTS.EDIT.ABSOLUTE}/${row.original.id}`}
                                            title="editar"
                                        >
                                            <HiOutlinePencilAlt size={18} />
                                        </Link>
                                        <button
                                            type="button"
                                            className="btn btn-link p-0 text-danger"
                                            title="excluir"
                                            onClick={() => openDeleteModal(row.original)}
                                            aria-label="Excluir cliente"
                                        >
                                            <HiOutlineTrash size={18} />
                                        </button>
                                    </span>
                                ) : null,
                        },
                    ]}
                    query={async (filters) => {
                        const documentValue = filters.find((f) => f.name === "document")?.value as string | undefined;
                        const document = documentValue ? format.unmask(documentValue) : undefined;
                        return await ClientService.getAll(document);
                    }}
                    fetchButton
                    cleanButton
                    filters={[
                        {
                            name: "document" as keyof ClientFilter,
                            label: "Documento",
                            componentType: TextFormFieldType.INPUT,
                            mask: "###.###.###-##",
                            placeholder: "000.000.000-00",
                            commitOnBlur: true,
                        },
                    ]}
                    queryName={["client", "listing", date]}
                />
            </Suspense>
        </Card >
    </>
}

export default ClientListing;