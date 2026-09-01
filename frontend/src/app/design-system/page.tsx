import { Button } from "@/components/ui/Button";

export default function DesignSystemPage() {
  return (
    <main className="flex flex-col gap-12 p-12 max-w-3xl mx-auto">
      <h1>Design System</h1>

      <section className="flex flex-col gap-4">
        <h2>Buttons</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
      </section>
    </main>
  );
}
