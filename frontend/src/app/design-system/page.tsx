import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Radio } from "@/components/ui/Radio";
import { Switch } from "@/components/ui/Switch";

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

      <section className="flex flex-col gap-4">
        <h2>Form fields</h2>
        <div className="flex gap-8 flex-wrap max-w-xl">
          <div className="flex-1 min-w-[220px] flex flex-col gap-3">
            <Input id="email" label="Text field" placeholder="votre@email.fr" />
            <Input id="focus-demo" label="Focus field" placeholder="Focus" autoFocus />
          </div>
          <div className="flex-1 min-w-[220px] flex flex-col gap-3">
            <Checkbox id="checkbox-demo" label="Checkbox" defaultChecked />
            <Radio id="radio-demo" name="radio-demo" label="Radio button (selected)" defaultChecked />
            <Switch id="switch-demo" label="Switch" defaultChecked />
          </div>
        </div>
      </section>
    </main>
  );
}
