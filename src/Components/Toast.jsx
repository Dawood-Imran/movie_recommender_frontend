import { Toaster } from "react-hot-toast"

export default function Toast() {
return (
    <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{ marginTop: "65px" }}
        toastOptions={{
            className: "",
            duration: 4000,
            style: {
                borderRadius: "10px",
                padding: "16px",
                fontSize: "14px",
            },
            success: {
                style: {
                    background: "#22c55e",
                    color: "#fff",
                },
                iconTheme: {
                    primary: "#fff",
                    secondary: "#22c55e",
                },
            },
            error: {
                style: {
                    background: "#ef4444",
                    color: "#fff",
                },
                iconTheme: {
                    primary: "#fff",
                    secondary: "#ef4444",
                },
            },
            loading: {
                style: {
                    background: "#1f2937",
                    color: "#fff",
                },
            },
        }}
    />
)
}
