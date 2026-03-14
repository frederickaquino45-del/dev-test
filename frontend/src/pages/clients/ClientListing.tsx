import React, { Suspense, useEffect, useState } from "react";
import { Button, Card, Row } from "react-bootstrap";
import { NAVIGATION_PATH } from "@/constants";
import { Client } from "@/types/api/Client";
import { ClientFilter } from "@/types/api/filters/ClientFilter";
import DataTable, { DataTableType } from "@/components/DataTable";
import { Link } from "react-router-dom";
import { HiOutlinePencilAlt } from "react-icons/hi";
import Loader from "@/components/Loader";
import ClientService from "@/services/ClientService";
import { TextFormFieldType } from "@/components/form/TextFormField/TextFormFieldType";
import { format } from "@/helpers/format";

const ClientListing = () => {
    const [date, setDate] = useState<Date>();

    useEffect(() => {
        setDate(new Date());
    }, []);

    return <>
        <Row style={{ justifyContent: "end", margin: "10px 0" }}>
            <Link to={NAVIGATION_PATH.CLIENTS.CREATE.ABSOLUTE}>
                <Button style={{ maxWidth: "fit-content", float: "right" }}>Adicionar</Button>
            </Link>
        </Row>
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
                        { Header: "Telefone", accessor: "phoneNumber" },
                        { Header: "Documento", accessor: "documentNumber" },
                        {
                            Header: "Ações",
                            id: "actions",
                            Cell: ({ row }) => (
                                row.original.id
                                    ? (
                                        <Link
                                            to={`${NAVIGATION_PATH.CLIENTS.EDIT.ABSOLUTE}/${row.original.id}`}
                                            title="editar"
                                        >
                                            <HiOutlinePencilAlt size={18} />
                                        </Link>
                                    )
                                    : null
                            ),
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