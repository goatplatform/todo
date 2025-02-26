// @deno-types="@types/react"
import React, { useRef, useState } from "react";
import { useDB, useDBReady, useItem, useQuery } from "@goatdb/goatdb/react";
import { kSchemaTask, type SchemaTypeTask } from "../common/schema.ts";
import { DeleteOutlineOutlined, LogoutRounded } from "@mui/icons-material";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

export function Header() {
  const db = useDB();
  const ref = useRef<HTMLInputElement>(null);
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mb: 3,
        display: "flex",
        gap: 2,
        alignItems: "center",
        borderRadius: 2,
      }}
    >
      <TextField
        placeholder="Enter task..."
        inputRef={ref}
        sx={{ flexGrow: 1 }}
        variant="outlined"
        size="medium"
        onKeyDown={(e) => {
          if (e.key === "Enter" && ref.current?.value) {
            db.create(`/data/${db.currentUser!.key}`, kSchemaTask, {
              text: ref.current.value,
            });
            ref.current.value = "";
          }
        }}
        InputProps={{
          endAdornment: (
            <Button
              variant="contained"
              color="primary"
              disableElevation
              onClick={() => {
                if (ref.current?.value) {
                  db.create(`/data/${db.currentUser!.key}`, kSchemaTask, {
                    text: ref.current.value,
                  });
                  ref.current.value = "";
                }
              }}
            >
              Add
            </Button>
          ),
        }}
      />
      <IconButton
        color="primary"
        aria-label="logout"
        onClick={() => {
          db.logout();
        }}
        sx={{
          ml: 1,
          bgcolor: "action.hover",
          "&:hover": {
            bgcolor: "action.selected",
          },
        }}
      >
        <LogoutRounded />
      </IconButton>
    </Paper>
  );
}

export type TaskItemProps = {
  path: string;
};
export function TaskItem({ path }: TaskItemProps) {
  // By calling the useItem() hook we ensure this component will rerender
  // whenever our task changes.
  const task = useItem<SchemaTypeTask>(path)!;
  // Updating the item automatically triggers remote updates in realtime
  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        gap: 2,
        alignItems: "center",
        py: 1,
        px: 2,
        transition: "all 0.2s",
        "&:hover": {
          bgcolor: "action.hover",
        },
      }}
    >
      <Checkbox
        checked={task.get("done")}
        onChange={(event) => task.set("done", event.target.checked)}
        color="primary"
      />
      <TextField
        value={task.get("text")}
        onChange={(event) => task.set("text", event.target.value)}
        variant="standard"
        sx={{ flexGrow: 1 }}
        InputProps={{
          sx: {
            textDecoration: task.get("done") ? "line-through" : "none",
            color: task.get("done") ? "text.secondary" : "text.primary",
          },
        }}
      />
      <Button
        variant="outlined"
        color="error"
        size="small"
        startIcon={<DeleteOutlineOutlined />}
        onClick={() => {
          task.isDeleted = true;
        }}
        sx={{
          borderRadius: 2,
          minWidth: "80px",
          transition: "all 0.2s",
          "&:hover": {
            boxShadow: 1,
            bgcolor: "error.light",
            color: "error.contrastText",
            borderColor: "error.light",
          },
        }}
      >
        Delete
      </Button>
    </Paper>
  );
}

export function Contents() {
  const db = useDB();
  const [showChecked, setShowChecked] = useState(true);
  // Open a query that fetches all tasks sorted by their texts.
  // The hook will automatically trigger a re-render when changes are made
  // either locally or by remote users.

  const query = useQuery({
    schema: kSchemaTask,
    source: `/data/${db.currentUser!.key}`,
    // Predicate and sort descriptor are expressed as plain functions. GoatDB
    // will automatically re-evaluate the query when the function changes.
    sortBy: "dateCreated",
    sortDescending: true,
    // When feeding a predicate with external state, use the optional ctx value
    predicate: ({ item, ctx }) => !item.get("done") || ctx.showChecked,
    // When set to true, the query will update with intermittent results as it
    // scans its source resulting in a more responsive UI
    showIntermittentResults: true,
    ctx: {
      showChecked,
    },
  });
  return (
    <Paper
      elevation={3}
      sx={{
        maxWidth: 800,
        width: "95%",
        mx: "auto",
        my: 4,
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
      }}
    >
      <Header />
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          borderRadius: 2,
          bgcolor: "action.hover",
        }}
      >
        <Typography variant="subtitle1" fontWeight="medium">
          Show Completed Tasks
        </Typography>
        <Checkbox
          checked={showChecked}
          onChange={(event) => setShowChecked(event.target.checked)}
          color="primary"
        />
      </Paper>
      <Paper
        elevation={1}
        sx={{
          borderRadius: 2,
          overflow: "auto",
          maxHeight: "60vh",
        }}
      >
        {query.results().length > 0
          ? (
            query.results().map(({ path }) => (
              <Paper
                key={path}
                elevation={0}
                sx={{
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:last-child": {
                    borderBottom: "none",
                  },
                }}
              >
                <TaskItem path={path} />
              </Paper>
            ))
          )
          : (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">No tasks found</Typography>
            </Box>
          )}
      </Paper>
    </Paper>
  );
}

export function Login() {
  const db = useDB();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [sendError, setSendError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await db.loginWithMagicLinkEmail(email)) {
      setEmailSent(true);
      setSendError(false);
    } else {
      setEmailSent(false);
      setSendError(true);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        maxWidth: 400,
        width: "90%",
        mx: "auto",
        my: { xs: 2, sm: 4, md: 8 },
        p: { xs: 2, sm: 3, md: 4 },
        borderRadius: 2,
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom fontWeight="medium">
        Welcome
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Sign in to access your tasks
      </Typography>

      <form onSubmit={handleSubmit}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <TextField
            id="email"
            type="email"
            label="Email address"
            placeholder="Enter your email"
            value={email}
            autoFocus
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            variant="outlined"
          />
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          disableElevation
          sx={{
            py: 1.5,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: "bold",
          }}
        >
          Send Login Link
        </Button>
      </form>

      {emailSent && (
        <Alert
          severity="success"
          sx={{ mt: 3, borderRadius: 2 }}
        >
          <AlertTitle>Success</AlertTitle>
          Email sent! Please check your inbox.
        </Alert>
      )}

      {sendError && (
        <Alert
          severity="error"
          sx={{ mt: 3, borderRadius: 2 }}
        >
          <AlertTitle>Error</AlertTitle>
          Error sending email. Please try again later.
        </Alert>
      )}
    </Paper>
  );
}

export function App() {
  const db = useDB();
  const ready = useDBReady();

  // Handle initial loading phase
  if (ready === "loading") {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: 3,
          bgcolor: (theme) => theme.palette.background.default,
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary">
          Loading your tasks...
        </Typography>
      </Box>
    );
  }

  if (ready === "error") {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          p: 3,
          bgcolor: (theme) => theme.palette.background.default,
        }}
      >
        <Alert
          severity="error"
          variant="filled"
          sx={{ maxWidth: 450, borderRadius: 2 }}
        >
          <AlertTitle>Connection Error</AlertTitle>
          <Typography variant="body1">
            We couldn't connect to the server. Please check your internet
            connection and reload the page.
          </Typography>
          <Button
            variant="contained"
            color="inherit"
            sx={{ mt: 2 }}
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </Alert>
      </Box>
    );
  }

  // Once loaded, continue to the contents of the app
  return db.loggedIn ? <Contents /> : <Login />;
}
