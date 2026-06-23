import { useState } from "react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import {
  LayoutDashboard,
  MousePointer2,
  Type,
  Layers,
  MessageSquare,
  Table as TableIcon,
  ArrowLeft,
  User,
  Bell,
  Navigation,
  Search,
  Check,
  Plus,
  Mail,
  Loader2,
  Trash,
  Settings,
  Calendar as CalendarIcon,
  PanelLeft,
  Maximize2,
  TrendingUp,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  ChevronRight,
  LogOut,
  CreditCard,
  Settings2,
  Keyboard,
  Cloud,
  Github,
  LifeBuoy,
  ChevronsUpDown,
} from "lucide-react"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuLabel,
} from "@/components/ui/context-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group"
import {
  Toggle
} from "@/components/ui/toggle"
import {
  ToggleGroup,
  ToggleGroupItem
} from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  Area,
  AreaChart,
  Pie,
  PieChart,
  Line,
  LineChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
} from "@/components/ui/menubar"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
} from "@/components/ui/input-group"

// Form Layer
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const pieData = [
  { browser: "chrome", visitors: 275, fill: "hsl(var(--chart-1))" },
  { browser: "safari", visitors: 200, fill: "hsl(var(--chart-2))" },
  { browser: "firefox", visitors: 187, fill: "hsl(var(--chart-3))" },
  { browser: "edge", visitors: 173, fill: "hsl(var(--chart-4))" },
  { browser: "other", visitors: 90, fill: "hsl(var(--chart-5))" },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--primary))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
}

const Showcase = () => {
  const [activeSection, setActiveSection] = useState("actions")
  const [date, setDate] = useState(new Date())
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [comboboxValue, setComboboxValue] = useState("")

  const frameworks = [
    { value: "next.js", label: "Next.js" },
    { value: "sveltekit", label: "SvelteKit" },
    { value: "nuxt.js", label: "Nuxt.js" },
    { value: "remix", label: "Remix" },
    { value: "astro", label: "Astro" },
  ]

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "", email: "" },
  })

  function onSubmit(values) {
    toast.success("Form Submitted!", {
      description: `User: ${values.username}, Email: ${values.email}`,
    })
  }

  const sections = [
    { id: "actions", label: "Actions & Menus", icon: <MousePointer2 className="w-4 h-4" /> },
    { id: "forms", label: "Forms & Controls", icon: <Type className="w-4 h-4" /> },
    { id: "navigation", label: "Navigation", icon: <Navigation className="w-4 h-4" /> },
    { id: "layout", label: "Layout & Tabs", icon: <Layers className="w-4 h-4" /> },
    { id: "data", label: "Data & Table", icon: <TableIcon className="w-4 h-4" /> },
    { id: "feedback", label: "Feedback", icon: <MessageSquare className="w-4 h-4" /> },
    { id: "overlays", label: "Overlays", icon: <Maximize2 className="w-4 h-4" /> },
    { id: "visualization", label: "Visualization", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "layout-extras", label: "Layout Extras", icon: <Maximize2 className="w-4 h-4" /> },
    { id: "advanced", label: "Advanced", icon: <Settings2 className="w-4 h-4" /> },
  ]

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      setActiveSection(id)
    }
  }

  return (
    <div className="flex min-h-screen bg-muted">
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r bg-white p-6 md:block">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-white">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">UI Showcase</span>
        </div>
        <ScrollArea className="h-[calc(100vh-140px)]">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${activeSection === section.id
                  ? "bg-muted text-white shadow-lg"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
              >
                {section.icon}
                {section.label}
              </button>
            ))}
          </nav>
        </ScrollArea>
        <div className="absolute bottom-6 left-6 right-6 pt-4 border-t">
          <Link to="/">
            <Button variant="outline" className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </aside>

      <main className="flex-1 md:ml-64">
        <div className="container mx-auto max-w-5xl px-6 py-12">
          <header className="mb-16">
            <Badge variant="secondary" className="mb-4">Full Shadcn UI</Badge>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
              Complete Component Showcase
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Tất cả các thành phần Shadcn UI đã được khôi phục và tổ chức lại một cách khoa học.
            </p>
          </header>

          <section id="actions" className="mb-24 scroll-mt-6">
            <h2 className="text-2xl font-bold mb-8">Actions & Menus</h2>
            <div className="grid gap-8 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle>Button Variants</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                  <Button disabled>Disabled</Button>
                  <Button><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Toggles & Groups</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Toggle aria-label="Toggle italic"><Plus className="h-4 w-4" /></Toggle>
                    <ToggleGroup type="multiple" variant="outline">
                      <ToggleGroupItem value="b">B</ToggleGroupItem>
                      <ToggleGroupItem value="i">I</ToggleGroupItem>
                      <ToggleGroupItem value="u">U</ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="outline">Dropdown Menu</Button></DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem><User className="mr-2 h-4 w-4" />Profile<DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut></DropdownMenuItem>
                        <DropdownMenuItem><CreditCard className="mr-2 h-4 w-4" />Billing<DropdownMenuShortcut>⌘B</DropdownMenuShortcut></DropdownMenuItem>
                        <DropdownMenuItem><Settings className="mr-2 h-4 w-4" />Settings<DropdownMenuShortcut>⌘S</DropdownMenuShortcut></DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive"><LogOut className="mr-2 h-4 w-4" />Log out</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            </div>
          </section>

          <section id="forms" className="mb-24 scroll-mt-6">
            <h2 className="text-2xl font-bold mb-8">Forms & Controls</h2>
            <div className="grid gap-8 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Common Input Types</CardTitle>
                  <CardDescription>Standard HTML5 input variations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pass">Password Input</Label>
                    <Input id="pass" type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="num">Number Input</Label>
                    <Input id="num" type="number" placeholder="42" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="search">Search Tool</Label>
                    <Input id="search" type="search" placeholder="Looking for something?" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="file">File Selection</Label>
                    <Input id="file" type="file" className="cursor-pointer" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Advanced Selection</CardTitle>
                  <CardDescription>Complex selection patterns using Popover & Command</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Combobox (Searchable Select)</Label>
                    <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={comboboxOpen}
                          className="w-full justify-between"
                        >
                          {comboboxValue
                            ? frameworks.find((f) => f.value === comboboxValue)?.label
                            : "Select framework..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search framework..." />
                          <CommandList>
                            <CommandEmpty>No framework found.</CommandEmpty>
                            <CommandGroup>
                              {frameworks.map((f) => (
                                <CommandItem
                                  key={f.value}
                                  value={f.value}
                                  onSelect={(currentValue) => {
                                    setComboboxValue(currentValue === comboboxValue ? "" : currentValue)
                                    setComboboxOpen(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      comboboxValue === f.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {f.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Date Picker (Popover)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? date.toDateString() : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardContent>
              </Card>
              <Card className="md:col-span-2">
                <CardHeader><CardTitle>Form Validation (Zod + Hook Form)</CardTitle></CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl><Input placeholder="@handle" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl><Input placeholder="email@example.com" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button type="submit">Submit Professional Form</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Selection & Inputs</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Category Selection</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Pick a topic" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="react">React</SelectItem>
                        <SelectItem value="vue">Vue</SelectItem>
                        <SelectItem value="next">Next.js</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Additional Details</Label>
                    <Textarea placeholder="Type your message here..." />
                  </div>
                  <div className="space-y-2">
                    <Label>OTP Verification</Label>
                    <InputOTP maxLength={6}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <div className="space-y-4">
                    <Label>Input Groups</Label>
                    <InputGroup>
                      <InputGroupAddon>
                        <InputGroupText><Mail className="h-4 w-4" /></InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput placeholder="Email Address" />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton>Send</InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Interactive Controls</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup defaultValue="option-one">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="option-one" id="o1" /><Label htmlFor="o1">Option One</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="option-two" id="o2" /><Label htmlFor="o2">Option Two</Label></div>
                  </RadioGroup>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <Label>Notifications</Label>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Terms & Conditions</Label>
                    <Checkbox />
                  </div>
                  <div className="space-y-2">
                    <Label>Volume Level</Label>
                    <Slider defaultValue={[45]} max={100} step={1} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section id="navigation" className="mb-24 scroll-mt-6">
            <h2 className="text-2xl font-bold mb-8">Navigation Components</h2>
            <div className="space-y-8">
              <Card>
                <CardHeader><CardTitle>Breadcrumbs & Pagination</CardTitle></CardHeader>
                <CardContent className="space-y-8">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem><BreadcrumbLink href="/docs">Docs</BreadcrumbLink></BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem><BreadcrumbPage>Showcase</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
                      <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
                      <PaginationItem><PaginationLink href="#">2</PaginationLink></PaginationItem>
                      <PaginationItem><PaginationEllipsis /></PaginationItem>
                      <PaginationItem><PaginationNext href="#" /></PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </CardContent>
              </Card>

              <div className="grid gap-8 md:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle>Menubar</CardTitle></CardHeader>
                  <CardContent>
                    <Menubar>
                      <MenubarMenu>
                        <MenubarTrigger>File</MenubarTrigger>
                        <MenubarContent>
                          <MenubarItem>New Tab <MenubarShortcut>⌘T</MenubarShortcut></MenubarItem>
                          <MenubarSeparator />
                          <MenubarSub>
                            <MenubarSubTrigger>Share</MenubarSubTrigger>
                            <MenubarSubContent><MenubarItem>Email</MenubarItem></MenubarSubContent>
                          </MenubarSub>
                        </MenubarContent>
                      </MenubarMenu>
                    </Menubar>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Navigation Menu</CardTitle></CardHeader>
                  <CardContent>
                    <NavigationMenu>
                      <NavigationMenuList>
                        <NavigationMenuItem>
                          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
                          <NavigationMenuContent>
                            <ul className="grid w-[400px] gap-3 p-4">
                              <li className="p-3 hover:bg-muted rounded-md">Installation Guide</li>
                              <li className="p-3 hover:bg-muted rounded-md">Theming docs</li>
                            </ul>
                          </NavigationMenuContent>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                          <NavigationMenuLink asChild>
                            <Link to="/" className={navigationMenuTriggerStyle()}>Home</Link>
                          </NavigationMenuLink>
                        </NavigationMenuItem>
                      </NavigationMenuList>
                    </NavigationMenu>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <section id="layout" className="mb-24 scroll-mt-6">
            <h2 className="text-2xl font-bold mb-8">Layout & Content</h2>
            <div className="space-y-8">
              <Tabs defaultValue="t1" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                  <TabsTrigger value="t1">Overview</TabsTrigger>
                  <TabsTrigger value="t2">Technical Details</TabsTrigger>
                </TabsList>
                <TabsContent value="t1" className="pt-4">
                  <Card className="border-none bg-muted"><CardContent className="pt-6">Product overview and key benefits showing here.</CardContent></Card>
                </TabsContent>
              </Tabs>
              
              <div className="grid gap-8 md:grid-cols-2">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Is it accessible?</AccordionTrigger>
                    <AccordionContent>Yes. It adheres to the WAI-ARIA design patterns.</AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Is it styled?</AccordionTrigger>
                    <AccordionContent>Yes. it comes with default styles that match the other components.</AccordionContent>
                  </AccordionItem>
                </Accordion>
                <div className="pt-4 px-4 border rounded-lg bg-white">
                   <ScrollArea className="h-40 w-full rounded-md border p-4">
                      Jokester began sneaking into the castle in the middle of the night and leaving jokes all over the place: under the king's pillow, in his soup, even in the royal washroom. The king was amused, but the queen was not.
                   </ScrollArea>
                </div>
              </div>
            </div>
          </section>

          <section id="data" className="mb-24 scroll-mt-6">
            <h2 className="text-2xl font-bold mb-8">Data & Records</h2>
            <div className="grid gap-8 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle>Contextual Records</CardTitle></CardHeader>
                <CardContent className="px-0">
                  <Table>
                    <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                    <TableBody>
                      <TableRow><TableCell>Server Alpha</TableCell><TableCell><Badge variant="outline">Steady</Badge></TableCell><TableCell className="text-right"><Button variant="ghost" size="sm">Logs</Button></TableCell></TableRow>
                      <TableRow><TableCell>Database B</TableCell><TableCell><Badge variant="secondary">Busy</Badge></TableCell><TableCell className="text-right"><Button variant="ghost" size="sm">Logs</Button></TableCell></TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Scheduling</CardTitle></CardHeader>
                <CardContent className="flex justify-center border-t py-6"><Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md" /></CardContent>
              </Card>
            </div>
          </section>

          <section id="feedback" className="mb-24 scroll-mt-6">
            <h2 className="text-2xl font-bold mb-8">System Feedback</h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <Alert><AlertCircle className="h-4 w-4" /><AlertTitle>Success</AlertTitle><AlertDescription>Component sync completed successfully.</AlertDescription></Alert>
                <Card className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar><AvatarImage src="https://github.com/shadcn.png" /><AvatarFallback>CN</AvatarFallback></Avatar>
                    <div><div className="font-bold text-sm">Design System</div><div className="text-xs text-muted-foreground">@shadcn</div></div>
                  </div>
                  <Progress value={78} />
                  <div className="flex gap-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-24" /></div>
                </Card>
              </div>
              <Card>
                <CardHeader><CardTitle>Toasts & Notifications</CardTitle></CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <Button onClick={() => toast.success("Process successful!")}>Toast Success</Button>
                  <Button variant="outline" onClick={() => toast.error("Deployment failed")}>Toast Error</Button>
                  <Button variant="secondary" onClick={() => toast.info("System maintenance in 1h")}>Toast Info</Button>
                </CardContent>
              </Card>
            </div>
          </section>

          <section id="overlays" className="mb-24 scroll-mt-6">
            <h2 className="text-2xl font-bold mb-8">Overlays & Modals</h2>
            <div className="flex flex-wrap gap-4">
              <Dialog><DialogTrigger asChild><Button>Dialog</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Confirmation</DialogTitle></DialogHeader><p>Standard dialog for confirmations.</p></DialogContent></Dialog>
              <AlertDialog><AlertDialogTrigger asChild><Button variant="destructive">Alert Dialog</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
              <Sheet><SheetTrigger asChild><Button variant="outline">Sheet</Button></SheetTrigger><SheetContent><SheetHeader><SheetTitle>Settings</SheetTitle></SheetHeader><div className="py-4">Sidebar configuration content.</div></SheetContent></Sheet>
              <Drawer><DrawerTrigger asChild><Button variant="secondary">Drawer</Button></DrawerTrigger><DrawerContent><div className="p-10 text-center">Mobile bottom drawer menu.</div></DrawerContent></Drawer>
              <Popover><PopoverTrigger asChild><Button variant="ghost">Popover</Button></PopoverTrigger><PopoverContent className="w-80"><p>Brief context for a specific UI element.</p></PopoverContent></Popover>
            </div>
          </section>

          <section id="visualization" className="mb-24 scroll-mt-6">
            <h2 className="text-2xl font-bold mb-8">Charts & Visualization</h2>
            <div className="grid gap-8 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Bar Chart - Growth</CardTitle>
                  <CardDescription>Comparison between Desktop and Mobile</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <BarChart data={chartData}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(0, 3)} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
                      <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Area Chart - Usage</CardTitle>
                  <CardDescription>Trend over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <AreaChart data={chartData}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(0, 3)} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area type="monotone" dataKey="desktop" stroke="var(--color-desktop)" fill="var(--color-desktop)" fillOpacity={0.4} />
                      <Area type="monotone" dataKey="mobile" stroke="var(--color-mobile)" fill="var(--color-mobile)" fillOpacity={0.4} />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Line Chart - Active Users</CardTitle>
                  <CardDescription>Monthly active users engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <LineChart data={chartData}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(0, 3)} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="desktop" stroke="var(--color-desktop)" strokeWidth={2} />
                      <Line type="monotone" dataKey="mobile" stroke="var(--color-mobile)" strokeWidth={2} />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pie Chart - Distribution</CardTitle>
                  <CardDescription>Browser market share</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                    <PieChart>
                      <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                      <Pie data={pieData} dataKey="visitors" nameKey="browser" innerRadius={60} />
                      <ChartLegend content={<ChartLegendContent />} />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Radar Chart - Performance</CardTitle>
                  <CardDescription>Multi-dimensional analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                    <RadarChart data={chartData}>
                      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                      <PolarGrid />
                      <PolarAngleAxis dataKey="month" />
                      <Radar dataKey="desktop" fill="var(--color-desktop)" fillOpacity={0.6} dot={{ r: 4, fillOpacity: 1 }} />
                      <Radar dataKey="mobile" fill="var(--color-mobile)" fillOpacity={0.6} />
                    </RadarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader><CardTitle>Preview Gallery</CardTitle></CardHeader>
                <CardContent className="flex justify-center p-10">
                  <Carousel className="w-full max-w-sm">
                    <CarouselContent>
                      {[1, 2, 3].map((i) => (
                        <CarouselItem key={i}>
                          <div className="aspect-video bg-secondary flex items-center justify-center rounded-xl">
                            <ImageIcon className="w-12 h-12 text-slate-300 mr-2" />
                            <span className="text-xl font-bold text-muted-foreground">Slide {i}</span>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious /><CarouselNext />
                  </Carousel>
                </CardContent>
              </Card>
            </div>
          </section>

          <section id="layout-extras" className="mb-24 scroll-mt-6">
            <h2 className="text-2xl font-bold mb-8">Layout Extras</h2>
            <div className="grid gap-8 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Aspect Ratio</CardTitle>
                  <CardDescription>Maintain consistent image dimensions (16:9)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full overflow-hidden rounded-md border">
                    <AspectRatio ratio={16 / 9} className="bg-secondary flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-slate-300" />
                    </AspectRatio>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Collapsible</CardTitle>
                  <CardDescription>Expandable content sections</CardDescription>
                </CardHeader>
                <CardContent>
                  <Collapsible className="w-full space-y-2">
                    <div className="flex items-center justify-between space-x-4 px-4">
                      <h4 className="text-sm font-semibold">@peduarte starred 3 repositories</h4>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-9 p-0">
                          <Plus className="h-4 w-4" />
                          <span className="sr-only">Toggle</span>
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <div className="rounded-md border px-4 py-3 font-mono text-sm">
                      @radix-ui/primitives
                    </div>
                    <CollapsibleContent className="space-y-2">
                      <div className="rounded-md border px-4 py-3 font-mono text-sm">
                        @radix-ui/react-collapsible
                      </div>
                      <div className="rounded-md border px-4 py-3 font-mono text-sm">
                        @stitches/react
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            </div>
          </section>

          <section id="advanced" className="mb-32 scroll-mt-6">
            <h2 className="text-2xl font-bold mb-8">Advanced Interactions</h2>
            <div className="grid gap-8">
              <Card>
                <CardHeader><CardTitle>Workspace Context</CardTitle></CardHeader>
                <CardContent>
                  <ContextMenu>
                    <ContextMenuTrigger className="flex h-[150px] w-full items-center justify-center rounded-md border border-dashed text-sm">Right-click here</ContextMenuTrigger>
                    <ContextMenuContent className="w-64">
                      <ContextMenuItem>Back<ContextMenuShortcut>⌘[</ContextMenuShortcut></ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuSub>
                        <ContextMenuSubTrigger>More Options</ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48"><ContextMenuItem>Save Page As...</ContextMenuItem></ContextMenuSubContent>
                      </ContextMenuSub>
                    </ContextMenuContent>
                  </ContextMenu>
                </CardContent>
              </Card>

              <div className="grid gap-8 md:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle>Resizable Layout</CardTitle></CardHeader>
                  <CardContent>
                    <ResizablePanelGroup direction="horizontal" className="min-h-[150px] w-full rounded-lg border">
                      <ResizablePanel defaultSize={25}><div className="flex h-full items-center justify-center p-6 bg-muted text-xs">Side</div></ResizablePanel>
                      <ResizableHandle withHandle /><ResizablePanel defaultSize={75}><div className="flex h-full items-center justify-center p-6 text-xs">Main</div></ResizablePanel>
                    </ResizablePanelGroup>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Discovery Tools</CardTitle></CardHeader>
                  <CardContent className="flex gap-4 items-center justify-center h-full pt-6">
                    <HoverCard>
                      <HoverCardTrigger asChild><Button variant="link">Hover Card</Button></HoverCardTrigger>
                      <HoverCardContent className="w-80">
                         <div className="flex justify-between space-x-4">
                            <Avatar><AvatarFallback>VC</AvatarFallback></Avatar>
                            <div className="space-y-1"><h4 className="text-sm font-semibold">@shadcn</h4><p className="text-sm text-muted-foreground underline">Radix-UI and Tailwind.</p></div>
                          </div>
                      </HoverCardContent>
                    </HoverCard>
                    <TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="outline">Tooltip</Button></TooltipTrigger><TooltipContent><p>Add to library</p></TooltipContent></Tooltip></TooltipProvider>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader><CardTitle>System Search</CardTitle></CardHeader>
                <CardContent>
                  <Command className="rounded-lg border shadow-md">
                    <CommandInput placeholder="Search..." />
                    <CommandList><CommandEmpty>No results.</CommandEmpty><CommandGroup heading="Suggestions"><CommandItem>Project A</CommandItem><CommandItem>Project B</CommandItem></CommandGroup></CommandList>
                  </Command>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Showcase
