// @deno-types="@types/react"
import React, { useRef, useState } from "react";
import { useDB, useDBReady, useItem, useQuery } from "@goatdb/goatdb/react";
import { kSchemaTask, type SchemaTypeTask } from "../common/schema.ts";
import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Sheet,
  Typography,
} from "@mui/joy";
import {
  CodeOutlined,
  DeleteOutlineOutlined,
  LogoutRounded,
} from "@mui/icons-material";

export function Header() {
  const db = useDB();
  const ref = useRef<HTMLInputElement>(null);
  return (
    <Sheet
      variant="outlined"
      sx={{
        p: 2,
        mb: 2,
        display: "flex",
        gap: 2,
        alignItems: "center",
        borderRadius: "sm",
      }}
    >
      <Input
        placeholder="Enter task..."
        slotProps={{
          input: {
            ref,
          },
        }}
        sx={{ flexGrow: 1 }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && ref.current?.value) {
            db.create(`/data/${db.currentUser!.key}`, kSchemaTask, {
              text: ref.current.value,
            });
            ref.current.value = "";
          }
        }}
        endDecorator={
          <Button
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
        }
      />
      <IconButton
        variant="soft"
        color="neutral"
        onClick={() => {
          db.logout();
        }}
      >
        <LogoutRounded />
      </IconButton>
    </Sheet>
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
    <Sheet
      sx={{
        display: "flex",
        gap: 2,
        alignItems: "center",
      }}
    >
      <Checkbox
        checked={task.get("done")}
        onChange={(event) => task.set("done", event.target.checked)}
      />
      <Input
        value={task.get("text")}
        onChange={(event) => task.set("text", event.target.value)}
        sx={{ flexGrow: 1 }}
      />
      <Button
        variant="soft"
        color="danger"
        size="sm"
        startDecorator={<DeleteOutlineOutlined />}
        onClick={() => {
          task.isDeleted = true;
        }}
        sx={{
          borderRadius: "md",
          boxShadow: "sm",
          "&:hover": {
            boxShadow: "md",
          },
        }}
      >
        Delete
      </Button>
    </Sheet>
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
    <Sheet
      variant="outlined"
      sx={{
        maxWidth: 800,
        mx: "auto",
        my: 4,
        p: 3,
        borderRadius: "sm",
      }}
    >
      <Header />
      <Sheet
        variant="soft"
        sx={{
          p: 2,
          mb: 2,
          display: "flex",
          alignItems: "center",
          gap: 1,
          borderRadius: "sm",
        }}
      >
        <Typography>Show Completed Tasks</Typography>
        <Checkbox
          checked={showChecked}
          onChange={(event) => setShowChecked(event.target.checked)}
        />
      </Sheet>
      <Sheet
        variant="outlined"
        sx={{
          borderRadius: "sm",
          overflow: "auto",
        }}
      >
        {query.results().map(({ path }) => (
          <Sheet
            key={path}
            sx={{
              p: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
              "&:last-child": {
                borderBottom: "none",
              },
            }}
          >
            <TaskItem path={path} />
          </Sheet>
        ))}
      </Sheet>
    </Sheet>
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
    <Sheet
      variant="outlined"
      sx={{
        maxWidth: 400,
        mx: "auto",
        my: 4,
        p: 3,
        borderRadius: "sm",
      }}
    >
      <Typography level="h4" component="h1" sx={{ mb: 2 }}>
        Welcome
      </Typography>

      <form onSubmit={handleSubmit}>
        <FormControl sx={{ mb: 2 }}>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            autoFocus
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>

        <Button
          type="submit"
          fullWidth
        >
          Send Login Link
        </Button>
      </form>

      {emailSent && (
        <Alert
          variant="soft"
          color="success"
          sx={{ mt: 2 }}
        >
          Email sent! Please check your inbox.
        </Alert>
      )}

      {sendError && (
        <Alert
          variant="soft"
          color="danger"
          sx={{ mt: 2 }}
        >
          Error sending email. Please try again later.
        </Alert>
      )}
    </Sheet>
  );
}

export function App() {
  const db = useDB();
  const ready = useDBReady();

  // Handle initial loading phase
  if (ready === "loading") {
    return (
      <Sheet
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: 2,
        }}
      >
        <CircularProgress size="lg" />
        <Typography level="body-sm">Loading...</Typography>
      </Sheet>
    );
  }

  if (ready === "error") {
    return (
      <Sheet
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          p: 2,
        }}
      >
        <Alert
          variant="soft"
          color="danger"
          size="lg"
          sx={{ maxWidth: 400 }}
        >
          <Typography level="h4">Error</Typography>
          <Typography level="body-sm">
            Something went wrong. Please reload the page.
          </Typography>
        </Alert>
      </Sheet>
    );
  }

  // Once loaded, continue to the contents of the app
  return db.loggedIn ? <Contents /> : <Login />;
}
