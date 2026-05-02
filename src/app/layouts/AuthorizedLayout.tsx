import { NavLink, Outlet } from "react-router-dom";
import { Paper, Text, Title } from "@mantine/core";

const links = [
  { to: "/screening", label: "Форма предсказаний" },
  { to: "/predictions", label: "Список предсказаний" },
];

export function AuthorizedLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col lg:flex-row">
        <aside className="flex w-full flex-col border-b border-slate-200 bg-white p-4 lg:w-72 lg:border-b-0 lg:border-r lg:p-6">
          <Title order={4} c="blue.8" mb="xs">
            Навигация
          </Title>
          <Text size="sm" c="dimmed" mb="md">
            Разделы авторизованного пользователя
          </Text>

          <nav className="flex flex-col gap-2">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to}>
                {({ isActive }) => (
                  <Paper
                    withBorder
                    radius="md"
                    px="md"
                    py="sm"
                    className={
                      isActive
                        ? "border-blue-300 bg-blue-50"
                        : "border-slate-200 bg-white"
                    }
                  >
                    <Text
                      c={isActive ? "blue.8" : "dark"}
                      fw={isActive ? 600 : 500}
                    >
                      {link.label}
                    </Text>
                  </Paper>
                )}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
