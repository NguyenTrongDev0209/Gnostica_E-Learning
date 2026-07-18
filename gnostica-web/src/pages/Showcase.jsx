import React, { useState } from "react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast, Toaster } from "sonner"

// Lucide Icons
import {
  AlertCircle, ArrowLeft, Calendar as CalendarIcon, Check,
  ChevronRight, ChevronsUpDown, CreditCard, Github, Image as ImageIcon,
  Keyboard, LayoutDashboard, LifeBuoy, Loader2, LogOut, Mail, Plus,
  Settings, User, MousePointer2, Type, Layers, MessageSquare,
  Table as TableIcon, Maximize2, TrendingUp, Settings2, Bell, Navigation, Search, PanelLeft, CheckCircle2, MoreVertical, Cloud,
  ShoppingCart, Eye, Edit, Trash, AlertTriangle, Info
} from "lucide-react"

import { cn } from "@/lib/utils"

// --- SHADCN UI COMPONENTS (LEFT COLUMN) ---
// A
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// B
import { Badge } from "@/components/ui/badge"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
// C
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuTrigger, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger } from "@/components/ui/context-menu"
// D
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// F
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
// H
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
// I
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupInput } from "@/components/ui/input-group"
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp"
// L
import { Label } from "@/components/ui/label"
// M
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarTrigger, MenubarSub, MenubarSubContent, MenubarSubTrigger } from "@/components/ui/menubar"
// N
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
// P
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
// R
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
// S
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
// T
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Recharts for Chart Component
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

// --- SYSTEM DESIGN COMPONENTS (RIGHT COLUMN) ---
import {
  AppButton, IconLabelButton,
  HorizontalIconLabelButton, AppIconButton, AppHeaderButton, AppHamburgerButton,
  AppNavLink, AppUserMenu, AppLogo, TableActionIconButton
} from "@/components/common/micro/AppButton"
import CourseCard, { CourseCardHorizontal, ForumPostCard } from "@/components/common/composite/CourseCard"
import AppInput, { AppPasswordInput } from "@/components/common/micro/AppInput"
import AppSearchInput from "@/components/common/micro/AppSearchInput"
import CommentCard from "@/components/common/composite/CommentCard"
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb"
import DataTable from "@/components/common/composite/DataTable"
import AppAccordion from "@/components/common/micro/AppAccordion"
import AppAlert from "@/components/common/micro/AppAlert"
import AppAlertDialog from "@/components/common/micro/AppAlertDialog"
import AppAspectRatio from "@/components/common/micro/AppAspectRatio"
import AppAvatar, { AppAvatarGroup } from "@/components/common/micro/AppAvatar"
import AppBadge from "@/components/common/micro/AppBadge"
import AppCalendar from "@/components/common/micro/AppCalendar"
import AppSelect from "@/components/common/micro/AppSelect"
import AppCarousel from "@/components/common/micro/AppCarousel"
import AppChart from "@/components/common/micro/AppChart"
import NotificationBell from "@/components/common/composite/NotificationBell"
import { AppCheckbox } from "@/components/common/micro/AppCheckbox"
import {
  AppCommand,
  AppCommandInput,
  AppCommandList,
  AppCommandEmpty,
  AppCommandGroup,
  AppCommandItem,
  AppCommandShortcut,
  AppCommandPalette,
  AppCommandSeparator
} from "@/components/common/micro/AppCommand"
import { AppDialog } from "@/components/common/micro/AppDialog"
import { AppDropdownMenu } from "@/components/common/micro/AppDropdownMenu"
import AppTextarea from "@/components/common/micro/AppTextarea"
import AppRadioGroup from "@/components/common/micro/AppRadioGroup"
import AppSwitch from "@/components/common/micro/AppSwitch"
import AppSlider from "@/components/common/micro/AppSlider"
import DataFilter, { DataFilterSidebar, DataFilterSidebarChecklist, DataFilterDropdownChecklist, AppDatePicker, AppDateRangePicker, ChartDateFilters } from "@/components/common/composite/DataFilter";
import { DataForm, DataFormField } from "@/components/common/composite/DataForm"
import AppMenubar from "@/components/common/micro/AppMenubar"
import AppNavigationMenu from "@/components/common/micro/AppNavigationMenu"
import AppResizable from "@/components/common/micro/AppResizable"
import AppScrollArea from "@/components/common/micro/AppScrollArea"
import AppSheet from "@/components/common/micro/AppSheet"
import AppSkeleton from "@/components/common/micro/AppSkeleton"
import { AppToast } from "@/components/common/micro/AppToast"
import AppSeparator from "@/components/common/micro/AppSeparator"
import MicroAppTable from "@/components/common/micro/AppTable"
import AppTabs from "@/components/common/micro/AppTabs"
import AppToggle from "@/components/common/micro/AppToggle"
import { AppToggleGroup } from "@/components/common/micro/AppToggleGroup"
import AppTooltip from "@/components/common/micro/AppTooltip"
import AppPagination from "@/components/common/micro/AppPagination"
import AppCard, { AppCardHeader, AppCardTitle, AppCardContent } from "@/components/common/micro/AppCard"
import AppCollapsible, { AppCollapsibleTrigger, AppCollapsibleContent } from "@/components/common/micro/AppCollapsible"
import AppContextMenu, { AppContextMenuTrigger, AppContextMenuContent, AppContextMenuItem } from "@/components/common/micro/AppContextMenu"
import AppDrawer, { AppDrawerTrigger, AppDrawerContent, AppDrawerHeader, AppDrawerTitle, AppDrawerDescription } from "@/components/common/micro/AppDrawer"
import AppHoverCard, { AppHoverCardTrigger, AppHoverCardContent } from "@/components/common/micro/AppHoverCard"
import AppPopover, { AppPopoverTrigger, AppPopoverContent } from "@/components/common/micro/AppPopover"
import AppProgress from "@/components/common/micro/AppProgress"

const formSchema = z.object({
  username: z.string().min(2, { message: "Username must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
})

const complexFormSchema = z.object({
  fullName: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu quá ngắn (ít nhất 6 ký tự)"),
  role: z.string().min(1, "Vui lòng chọn vai trò"),
  bio: z.string().min(10, "Giới thiệu bản thân phải dài hơn 10 ký tự").optional().or(z.literal('')),
  experience: z.array(z.number()).min(1),
  website: z.string().url("URL không hợp lệ").optional().or(z.literal('')),
  otp: z.string().length(6, "Mã OTP phải gồm 6 chữ số"),
  terms: z.boolean().refine(val => val === true, "Bạn phải đồng ý với điều khoản"),
  newsletter: z.boolean().default(false),
})

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
]

const chartConfig = {
  desktop: { label: "Desktop", color: "hsl(var(--primary))" },
  mobile: { label: "Mobile", color: "hsl(var(--chart-2))" },
}

const gnosticaChartData = [
  { month: "T1", sales: 186, users: 80, visits: 120 },
  { month: "T2", sales: 305, users: 200, visits: 250 },
  { month: "T3", sales: 237, users: 120, visits: 180 },
  { month: "T4", sales: 73, users: 190, visits: 200 },
  { month: "T5", sales: 209, users: 130, visits: 160 },
  { month: "T6", sales: 214, users: 140, visits: 210 },
];

const gnosticaChartConfig = {
  sales: { label: "Doanh thu", color: "var(--primary)" },
  users: { label: "Người dùng", color: "var(--success)" },
  visits: { label: "Lượt xem", color: "var(--info)" },
};

const pieChartData = [
  { name: "Frontend", value: 400, fill: "var(--primary)" },
  { name: "Backend", value: 300, fill: "var(--success)" },
  { name: "DevOps", value: 300, fill: "var(--warning)" },
  { name: "Design", value: 200, fill: "var(--info)" },
];

const pieChartConfig = {
  Frontend: { label: "Khóa Frontend" },
  Backend: { label: "Khóa Backend" },
  DevOps: { label: "Khóa DevOps" },
  Design: { label: "Khóa Design" },
};

const menubarData = [
  {
    trigger: "File",
    items: [
      { label: "New Tab", shortcut: "⌘T" },
      { label: "New Window", shortcut: "⌘N", disabled: true },
      { type: "separator" },
      { label: "Share", sub: [
        { label: "Email" },
        { label: "Message" },
        { type: "separator" },
        { label: "More..." }
      ]},
      { type: "separator" },
      { label: "Print", shortcut: "⌘P" }
    ]
  },
  {
    trigger: "Edit",
    items: [
      { label: "Undo", shortcut: "⌘Z" },
      { label: "Redo", shortcut: "⇧⌘Z" },
      { type: "separator" },
      { type: "checkbox", label: "Show Toolbar", checked: true }
    ]
  }
];

const navMenuData = [
  {
    label: "Getting Started",
    content: (
      <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
        <li className="row-span-3">
          <a
            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/20 to-primary/5 p-6 no-underline outline-none border"
            href="#"
          >
            <div className="mb-2 mt-4 text-lg font-extrabold text-primary">
              Gnostica
            </div>
            <p className="text-sm leading-tight text-muted-foreground">
              Hệ thống E-Learning với giao diện Glassmorphism đỉnh cao.
            </p>
          </a>
        </li>
        <li>
          <a href="#" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-primary/10 hover:text-primary">
            <div className="text-sm font-medium leading-none">Introduction</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1">Các component cơ bản của hệ thống.</p>
          </a>
        </li>
        <li>
          <a href="#" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-primary/10 hover:text-primary">
            <div className="text-sm font-medium leading-none">Installation</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1">Cách cấu hình và triển khai.</p>
          </a>
        </li>
      </ul>
    )
  },
  {
    label: "Components",
    links: [
      { title: "AppForm", href: "#", description: "Kiến trúc form data-driven kết hợp Zod validation." },
      { title: "AppMenubar", href: "#", description: "Menu bar thiết kế giống macOS với hỗ trợ menu lồng nhau." },
      { title: "AppNavigationMenu", href: "#", description: "Thanh điều hướng Mega-menu dành cho Desktop." },
      { title: "AppDropdownMenu", href: "#", description: "Menu thả xuống với glass effect." }
    ]
  },
  {
    label: "Documentation",
    href: "#"
  }
];

const resizableLayoutData = {
  direction: "horizontal",
  panels: [
    { 
      defaultSize: 20, 
      minSize: 15, 
      maxSize: 30, 
      content: <div className="flex h-full items-center justify-center p-6 font-semibold bg-primary/5 text-primary">Sidebar (20%)</div> 
    },
    { 
      defaultSize: 80, 
      group: {
        direction: "vertical",
        panels: [
          { defaultSize: 70, content: <div className="flex h-full items-center justify-center p-6 text-xl font-bold bg-background">Main Workspace (70%)</div> },
          { defaultSize: 30, content: <div className="flex h-full items-center justify-center p-6 font-semibold bg-muted/50 text-muted-foreground border-t">Terminal / Logs (30%)</div> }
        ]
      }
    }
  ]
};

const Showcase = () => {
  const [date, setDate] = useState(new Date())
  const [hamburgerOpen, setHamburgerOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "", email: "" },
  })

  function onSubmit(values) {
    toast.success("Form Submitted!", {
      description: `User: ${values.username}, Email: ${values.email}`,
    })
  }

  return (
    <div className="w-full h-screen overflow-y-auto bg-background p-4 sm:p-8">
      <Toaster />

      <Tabs defaultValue="system" className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-4">
            Component Showcase
          </h1>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="system" className="font-semibold">System Design</TabsTrigger>
            <TabsTrigger value="shadcn" className="font-semibold">Shadcn Core UI</TabsTrigger>
          </TabsList>
        </div>

        {/* SHADCN UI TAB */}
        <TabsContent value="shadcn" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <div className="w-full bg-muted/30 rounded-xl border p-6 md:p-10 shadow-sm">
            <header className="mb-10 text-center">
              <Badge variant="secondary" className="mb-4">Core UI</Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Shadcn UI
              </h2>
              <p className="mt-2 text-muted-foreground">
                Các component nền tảng được sắp xếp theo bảng chữ cái.
              </p>
            </header>

            <div className="space-y-24">
              <section>
                <h2 className="text-2xl font-bold mb-6 border-b pb-2">A</h2>
                <div className="grid gap-6 2xl:grid-cols-2">
                  <Card><CardHeader><CardTitle>Accordion</CardTitle></CardHeader><CardContent><Accordion type="single" collapsible><AccordionItem value="i1"><AccordionTrigger>Accessible?</AccordionTrigger><AccordionContent>Yes, very.</AccordionContent></AccordionItem></Accordion></CardContent></Card>
                  <Card><CardHeader><CardTitle>Alert</CardTitle></CardHeader><CardContent className="space-y-4"><Alert><AlertCircle className="w-4 h-4" /><AlertTitle>Info</AlertTitle><AlertDescription>Alert description</AlertDescription></Alert><Alert variant="destructive"><AlertCircle className="w-4 h-4" /><AlertTitle>Error</AlertTitle><AlertDescription>Destructive alert description</AlertDescription></Alert></CardContent></Card>
                  <Card><CardHeader><CardTitle>Alert Dialog</CardTitle></CardHeader><CardContent><AlertDialog><AlertDialogTrigger asChild><Button variant="outline">Delete</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction>Confirm</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></CardContent></Card>
                  <Card><CardHeader><CardTitle>Aspect Ratio</CardTitle></CardHeader><CardContent><AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden border"><img src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80" alt="Photo" className="object-cover w-full h-full" /></AspectRatio></CardContent></Card>
                  <Card><CardHeader><CardTitle>Avatar</CardTitle></CardHeader><CardContent><Avatar><AvatarImage src="https://github.com/shadcn.png" /><AvatarFallback>CN</AvatarFallback></Avatar></CardContent></Card>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-6 border-b pb-2">B</h2>
                <div className="grid gap-6 2xl:grid-cols-2">
                  <Card><CardHeader><CardTitle>Badge</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2"><Badge>Default</Badge><Badge variant="secondary">Secondary</Badge><Badge variant="destructive">Destructive</Badge><Badge variant="outline">Outline</Badge><Badge variant="ghost">Ghost</Badge></CardContent></Card>
                  <Card><CardHeader><CardTitle>Breadcrumb</CardTitle></CardHeader><CardContent><Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Current</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb></CardContent></Card>
                  <Card><CardHeader><CardTitle>Button</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2"><Button>Default</Button><Button variant="secondary">Secondary</Button><Button variant="destructive">Destructive</Button><Button variant="outline">Outline</Button><Button variant="ghost">Ghost</Button><Button variant="link">Link</Button></CardContent></Card>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-6 border-b pb-2">C</h2>
                <div className="grid gap-6 2xl:grid-cols-2">
                  <Card><CardHeader><CardTitle>Calendar</CardTitle></CardHeader><CardContent><Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border mx-auto w-fit" /></CardContent></Card>
                  <Card><CardHeader><CardTitle>Carousel</CardTitle></CardHeader><CardContent><Carousel className="w-full max-w-[200px] mx-auto"><CarouselContent>{Array.from({ length: 3 }).map((_, i) => (<CarouselItem key={i}><div className="p-1"><Card><CardContent className="flex aspect-square items-center justify-center p-6"><span className="text-4xl font-semibold">{i + 1}</span></CardContent></Card></div></CarouselItem>))}</CarouselContent><CarouselPrevious /><CarouselNext /></Carousel></CardContent></Card>
                  <Card className="2xl:col-span-2"><CardHeader><CardTitle>Chart</CardTitle></CardHeader><CardContent><ChartContainer config={chartConfig} className="h-[200px] w-full"><BarChart data={chartData}><CartesianGrid vertical={false} /><XAxis dataKey="month" /><Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} /></BarChart></ChartContainer></CardContent></Card>
                  <Card><CardHeader><CardTitle>Checkbox</CardTitle></CardHeader><CardContent className="flex items-center gap-2"><Checkbox id="c1" /><label htmlFor="c1" className="text-sm">Accept terms</label></CardContent></Card>
                  <Card><CardHeader><CardTitle>Collapsible</CardTitle></CardHeader><CardContent><Collapsible><CollapsibleTrigger asChild><Button variant="outline">Toggle</Button></CollapsibleTrigger><CollapsibleContent className="p-4 border mt-2 rounded-md bg-muted/50 text-sm">Content hidden inside</CollapsibleContent></Collapsible></CardContent></Card>
                  <Card><CardHeader><CardTitle>Command</CardTitle></CardHeader><CardContent><Command className="rounded-lg border shadow-md"><CommandInput placeholder="Type a command or search..." /><CommandList><CommandEmpty>No results found.</CommandEmpty><CommandGroup heading="Suggestions"><CommandItem>Calendar</CommandItem><CommandItem>Search Emoji</CommandItem></CommandGroup></CommandList></Command></CardContent></Card>
                  <Card><CardHeader><CardTitle>Context Menu</CardTitle></CardHeader><CardContent><ContextMenu><ContextMenuTrigger className="flex h-[100px] w-full items-center justify-center rounded-md border border-dashed text-sm">Right click here</ContextMenuTrigger><ContextMenuContent><ContextMenuItem>Profile</ContextMenuItem><ContextMenuItem>Billing</ContextMenuItem></ContextMenuContent></ContextMenu></CardContent></Card>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-6 border-b pb-2">D</h2>
                <div className="grid gap-6 2xl:grid-cols-2">
                  <Card><CardHeader><CardTitle>Dialog</CardTitle></CardHeader><CardContent><Dialog><DialogTrigger asChild><Button>Open</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Title</DialogTitle></DialogHeader>Content</DialogContent></Dialog></CardContent></Card>
                  <Card><CardHeader><CardTitle>Drawer</CardTitle></CardHeader><CardContent><Drawer><DrawerTrigger asChild><Button variant="outline">Open Drawer</Button></DrawerTrigger><DrawerContent><DrawerHeader><DrawerTitle>Drawer Title</DrawerTitle><DrawerDescription>Description</DrawerDescription></DrawerHeader><div className="p-4 flex justify-center">Content</div><DrawerFooter><Button>Submit</Button><DrawerClose asChild><Button variant="outline">Cancel</Button></DrawerClose></DrawerFooter></DrawerContent></Drawer></CardContent></Card>
                  <Card><CardHeader><CardTitle>Dropdown Menu</CardTitle></CardHeader><CardContent><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline">Menu</Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>Profile</DropdownMenuItem></DropdownMenuContent></DropdownMenu></CardContent></Card>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-6 border-b pb-2">F</h2>
                <Card><CardHeader><CardTitle>Form</CardTitle></CardHeader><CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
                      <FormField control={form.control} name="username" render={({ field }) => (<FormItem><FormLabel>Username</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <Button type="submit">Submit</Button>
                    </form>
                  </Form>
                </CardContent></Card>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-6 border-b pb-2">H</h2>
                <Card><CardHeader><CardTitle>Hover Card</CardTitle></CardHeader><CardContent><HoverCard><HoverCardTrigger asChild><Button variant="link">Hover me</Button></HoverCardTrigger><HoverCardContent className="text-sm">The react framework for the edge.</HoverCardContent></HoverCard></CardContent></Card>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-6 border-b pb-2">I</h2>
                <div className="grid gap-6 2xl:grid-cols-2">
                  <Card><CardHeader><CardTitle>Input</CardTitle></CardHeader><CardContent><Input placeholder="Email..." /></CardContent></Card>
                  <Card><CardHeader><CardTitle>Input Group</CardTitle></CardHeader><CardContent><InputGroup><InputGroupText>@</InputGroupText><InputGroupInput placeholder="Username" /><InputGroupButton><Button variant="secondary">Send</Button></InputGroupButton></InputGroup></CardContent></Card>
                  <Card><CardHeader><CardTitle>Input OTP</CardTitle></CardHeader><CardContent><InputOTP maxLength={4}><InputOTPGroup><InputOTPSlot index={0} /><InputOTPSlot index={1} /></InputOTPGroup><InputOTPSeparator /><InputOTPGroup><InputOTPSlot index={2} /><InputOTPSlot index={3} /></InputOTPGroup></InputOTP></CardContent></Card>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-6 border-b pb-2">L</h2>
                <Card><CardHeader><CardTitle>Label</CardTitle></CardHeader><CardContent><Label htmlFor="email">Your email address</Label></CardContent></Card>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-6 border-b pb-2">M</h2>
                <Card><CardHeader><CardTitle>Menubar</CardTitle></CardHeader><CardContent><Menubar><MenubarMenu><MenubarTrigger>File</MenubarTrigger><MenubarContent><MenubarItem>New</MenubarItem><MenubarSeparator /><MenubarItem>Quit</MenubarItem></MenubarContent></MenubarMenu></Menubar></CardContent></Card>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-6 border-b pb-2">N</h2>
                <Card><CardHeader><CardTitle>Navigation Menu</CardTitle></CardHeader><CardContent><NavigationMenu><NavigationMenuList><NavigationMenuItem><NavigationMenuTrigger>Item One</NavigationMenuTrigger><NavigationMenuContent><div className="p-4 w-[200px] text-sm">Content 1</div></NavigationMenuContent></NavigationMenuItem></NavigationMenuList></NavigationMenu></CardContent></Card>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-6 border-b pb-2">P</h2>
                <div className="grid gap-6 2xl:grid-cols-2">
                  <Card><CardHeader><CardTitle>Pagination</CardTitle></CardHeader><CardContent><Pagination><PaginationContent><PaginationItem><PaginationPrevious href="#" /></PaginationItem><PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem><PaginationItem><PaginationEllipsis /></PaginationItem><PaginationItem><PaginationNext href="#" /></PaginationItem></PaginationContent></Pagination></CardContent></Card>
                  <Card><CardHeader><CardTitle>Popover</CardTitle></CardHeader><CardContent><Popover><PopoverTrigger asChild><Button variant="outline">Open popover</Button></PopoverTrigger><PopoverContent className="text-sm">Place content for the popover here.</PopoverContent></Popover></CardContent></Card>
                  <Card className="2xl:col-span-2"><CardHeader><CardTitle>Progress</CardTitle></CardHeader><CardContent><Progress value={33} /></CardContent></Card>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-6 border-b pb-2">R</h2>
                <div className="grid gap-6 2xl:grid-cols-2">
                  <Card><CardHeader><CardTitle>Radio Group</CardTitle></CardHeader><CardContent><RadioGroup defaultValue="option-one"><div className="flex items-center space-x-2"><RadioGroupItem value="option-one" id="option-one" /><Label htmlFor="option-one">Option One</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="option-two" id="option-two" /><Label htmlFor="option-two">Option Two</Label></div></RadioGroup></CardContent></Card>
                  <Card><CardHeader><CardTitle>Resizable</CardTitle></CardHeader><CardContent><ResizablePanelGroup direction="horizontal" className="max-w-md rounded-lg border"><ResizablePanel defaultSize={50}><div className="flex h-[100px] items-center justify-center">One</div></ResizablePanel><ResizableHandle /><ResizablePanel defaultSize={50}><div className="flex h-[100px] items-center justify-center">Two</div></ResizablePanel></ResizablePanelGroup></CardContent></Card>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-6 border-b pb-2">S</h2>
                <div className="grid gap-6 2xl:grid-cols-2">
                  <Card><CardHeader><CardTitle>Scroll Area</CardTitle></CardHeader><CardContent><ScrollArea className="h-[100px] w-full rounded-md border p-4 text-sm">Jokester began sneaking into the castle in the middle of the night and leaving jokes all over the place: under the king's pillow, in his soup, even tied to the royal toilet seat. The king was furious.</ScrollArea></CardContent></Card>
                  <Card><CardHeader><CardTitle>Select</CardTitle></CardHeader><CardContent><Select><SelectTrigger><SelectValue placeholder="Theme" /></SelectTrigger><SelectContent><SelectItem value="light">Light</SelectItem><SelectItem value="dark">Dark</SelectItem></SelectContent></Select></CardContent></Card>
                  <Card><CardHeader><CardTitle>Separator</CardTitle></CardHeader><CardContent><div><div className="space-y-1"><h4 className="text-sm font-medium leading-none">Radix Primitives</h4></div><Separator className="my-4" /><div className="flex h-5 items-center space-x-4 text-sm"><div>Blog</div><Separator orientation="vertical" /><div>Docs</div></div></div></CardContent></Card>
                  <Card><CardHeader><CardTitle>Sheet</CardTitle></CardHeader><CardContent><Sheet><SheetTrigger asChild><Button variant="outline">Open Sheet</Button></SheetTrigger><SheetContent><SheetHeader><SheetTitle>Edit profile</SheetTitle><SheetDescription>Make changes to your profile here.</SheetDescription></SheetHeader></SheetContent></Sheet></CardContent></Card>
                  <Card><CardHeader><CardTitle>Skeleton</CardTitle></CardHeader><CardContent><div className="flex items-center space-x-4"><Skeleton className="h-12 w-12 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-[150px]" /><Skeleton className="h-4 w-[100px]" /></div></div></CardContent></Card>
                  <Card><CardHeader><CardTitle>Slider</CardTitle></CardHeader><CardContent><Slider defaultValue={[50]} max={100} step={1} /></CardContent></Card>
                  <Card><CardHeader><CardTitle>Sonner (Toaster)</CardTitle></CardHeader><CardContent><Button variant="outline" onClick={() => toast("Event has been created", { description: "Sunday, December 03, 2023 at 9:00 AM" })}>Show Toast</Button></CardContent></Card>
                  <Card><CardHeader><CardTitle>Switch</CardTitle></CardHeader><CardContent className="flex items-center gap-2"><Switch id="s1" /><Label htmlFor="s1">Airplane mode</Label></CardContent></Card>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-6 border-b pb-2">T</h2>
                <div className="grid gap-6 2xl:grid-cols-2">
                  <Card className="2xl:col-span-2"><CardHeader><CardTitle>Table</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>INV001</TableCell><TableCell>Paid</TableCell></TableRow></TableBody></Table></CardContent></Card>
                  <Card><CardHeader><CardTitle>Tabs</CardTitle></CardHeader><CardContent><Tabs defaultValue="a"><TabsList><TabsTrigger value="a">A</TabsTrigger><TabsTrigger value="b">B</TabsTrigger></TabsList><TabsContent value="a">Content A</TabsContent><TabsContent value="b">Content B</TabsContent></Tabs></CardContent></Card>
                  <Card><CardHeader><CardTitle>Textarea</CardTitle></CardHeader><CardContent><Textarea placeholder="Type your message here." /></CardContent></Card>
                  <Card><CardHeader><CardTitle>Toggle</CardTitle></CardHeader><CardContent className="flex gap-2"><Toggle>Default</Toggle><Toggle variant="outline">Outline</Toggle></CardContent></Card>
                  <Card><CardHeader><CardTitle>Toggle Group</CardTitle></CardHeader><CardContent><ToggleGroup type="multiple"><ToggleGroupItem value="a">A</ToggleGroupItem><ToggleGroupItem value="b">B</ToggleGroupItem><ToggleGroupItem value="c">C</ToggleGroupItem></ToggleGroup></CardContent></Card>
                  <Card><CardHeader><CardTitle>Tooltip</CardTitle></CardHeader><CardContent><TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="outline">Hover</Button></TooltipTrigger><TooltipContent><p>Add to library</p></TooltipContent></Tooltip></TooltipProvider></CardContent></Card>
                </div>
              </section>
            </div>
          </div>
        </TabsContent>

        {/* SYSTEM DESIGN TAB */}
        <TabsContent value="system" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <div className="w-full bg-white rounded-xl border p-6 md:p-10 shadow-sm">
            <header className="mb-10 text-center">
              <Badge className="mb-4 bg-accent-gradient border-none text-white">Gnostica Design System</Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                System Components
              </h2>
              <p className="mt-2 text-muted-foreground">
                Các component mở rộng được thiết kế riêng cho hệ thống (Common Components).
              </p>
            </header>

            <div className="space-y-12">
              {/* SECTION 1: DESIGN TOKENS */}
              <section>
                <h2 className="text-3xl font-extrabold mb-6 border-b pb-2 text-primary">1. Design Tokens</h2>
                <div className="space-y-6">

                  <Card>
                    <CardHeader><CardTitle>Colors & Gradients</CardTitle><CardDescription>Biến màu hệ thống (CSS Variables)</CardDescription></CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2"><div className="h-12 rounded-md bg-primary"></div><p className="text-xs font-medium text-center">Primary</p></div>
                      <div className="space-y-2"><div className="h-12 rounded-md bg-accent"></div><p className="text-xs font-medium text-center">Accent</p></div>
                      <div className="space-y-2"><div className="h-12 rounded-md bg-success"></div><p className="text-xs font-medium text-center">Success</p></div>
                      <div className="space-y-2"><div className="h-12 rounded-md bg-[image:var(--accent-gradient)]"></div><p className="text-xs font-medium text-center">Accent Gradient</p></div>
                      <div className="space-y-2"><div className="h-12 rounded-md bg-warning"></div><p className="text-xs font-medium text-center">Warning</p></div>
                      <div className="space-y-2"><div className="h-12 rounded-md bg-error"></div><p className="text-xs font-medium text-center">Error</p></div>
                      <div className="space-y-2"><div className="h-12 rounded-md bg-info"></div><p className="text-xs font-medium text-center">Info</p></div>
                      <div className="space-y-2"><div className="h-12 rounded-md bg-[image:var(--primary-gradient)]"></div><p className="text-xs font-medium text-center">Primary Gradient</p></div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>Typography</CardTitle><CardDescription>Kích thước chữ mặc định của hệ thống</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-baseline justify-between"><span className="text-4xl font-bold">Heading 1</span><span className="text-sm text-muted-foreground">text-4xl</span></div>
                      <div className="flex items-baseline justify-between"><span className="text-3xl font-bold">Heading 2</span><span className="text-sm text-muted-foreground">text-3xl</span></div>
                      <div className="flex items-baseline justify-between"><span className="text-2xl font-bold">Heading 3</span><span className="text-sm text-muted-foreground">text-2xl</span></div>
                      <div className="flex items-baseline justify-between"><span className="text-xl font-bold">Heading 4</span><span className="text-sm text-muted-foreground">text-xl</span></div>
                      <div className="flex items-baseline justify-between"><span className="text-base font-medium">Body Base Text</span><span className="text-sm text-muted-foreground">text-base</span></div>
                      <div className="flex items-baseline justify-between"><span className="text-sm text-muted-foreground">Small muted text</span><span className="text-sm text-muted-foreground">text-sm</span></div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>Shadows & Radius</CardTitle><CardDescription>Bo góc và bóng đổ Gnostica</CardDescription></CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="h-20 bg-background border flex items-center justify-center rounded-sm shadow-sm"><span className="text-xs">sm</span></div>
                      <div className="h-20 bg-background border flex items-center justify-center rounded-md shadow-md"><span className="text-xs">md</span></div>
                      <div className="h-20 bg-background border flex items-center justify-center rounded-lg shadow-lg"><span className="text-xs">lg</span></div>
                      <div className="h-20 bg-background border flex items-center justify-center rounded-xl shadow-xl"><span className="text-xs">xl</span></div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>Custom Utilities</CardTitle><CardDescription>Các class CSS viết tay ở index.css</CardDescription></CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <div className="h-24 bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853')] bg-cover bg-center rounded-lg p-4 flex items-center justify-center">
                        <div className="glass px-4 py-2 rounded text-sm font-medium text-foreground">.glass</div>
                      </div>
                      <div className="h-24 flex flex-col gap-2 items-center justify-center border rounded-lg p-4">
                        <div className="h-4 w-full skeleton"></div>
                        <div className="h-4 w-3/4 skeleton"></div>
                        <div className="text-xs text-muted-foreground mt-1">.skeleton</div>
                      </div>
                      <div className="h-20 bg-background border-glow flex flex-col items-center justify-center rounded-lg">
                        <span className="text-sm font-medium text-primary">.border-glow</span>
                      </div>
                      <div className="h-20 bg-background border hover-glow hover-lift flex flex-col text-center items-center justify-center rounded-lg cursor-pointer p-2">
                        <span className="text-xs">Hover me</span>
                        <span className="text-[10px] text-muted-foreground">.hover-lift & .hover-glow</span>
                      </div>
                    </CardContent>
                  </Card>

                </div>
              </section>

              {/* SECTION 2: MICRO COMPONENTS */}
              <section className="mt-12">
                <h2 className="text-3xl font-extrabold mb-6 border-b pb-2 text-primary">2. Micro Components</h2>
                <div className="space-y-10">

                  {/* Buttons & Actions */}
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-foreground/80">Buttons & Actions</h3>
                    <div className="space-y-6">
                      <Card>
                        <CardHeader><CardTitle>Base Buttons</CardTitle><CardDescription>Các loại nút bấm (AppButton) theo biến thể (variants)</CardDescription></CardHeader>
                        <CardContent className="flex flex-wrap items-center gap-4">
                          <AppButton appVariant="gradient">Simple Button</AppButton>
                          <AppButton appVariant="outlineGradient">Outline Gradient</AppButton>
                          <AppButton appVariant="ghostMuted" variant="ghost">Ghost Button</AppButton>
                          <AppButton appVariant="category" className="text-sm h-10 px-4">
                            <Layers className="w-4 h-4 mr-2 inline" /> Danh mục
                          </AppButton>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>Special Buttons</CardTitle><CardDescription>Các nút bấm đặc biệt có chứa Icon và Badge, có thể dùng ở mọi nơi (nền sáng/tối đều được)</CardDescription></CardHeader>
                        <CardContent className="flex flex-wrap items-center gap-6">
                          <IconLabelButton icon={User} badge={2}>Đăng nhập</IconLabelButton>
                          <HorizontalIconLabelButton icon={ShoppingCart}>Giỏ hàng</HorizontalIconLabelButton>
                          <AppIconButton icon={Bell} badge={5} />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>Header Specific Buttons</CardTitle><CardDescription>Các nút bấm thiết kế riêng cho thanh Header (Bắt buộc dùng trên nền tối)</CardDescription></CardHeader>
                        <CardContent className="space-y-6">
                          <div className="flex flex-wrap items-center gap-6 bg-slate-900 p-6 rounded-xl border">
                            <AppHeaderButton icon={Mail} label="Inbox" badge={1} />
                            <div className="ml-auto flex items-center gap-4">
                              <AppHamburgerButton isOpen={hamburgerOpen} onClick={() => setHamburgerOpen(!hamburgerOpen)} className="text-white" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>Table Actions</CardTitle><CardDescription>Dùng cho cột thao tác trong bảng dữ liệu</CardDescription></CardHeader>
                        <CardContent className="flex gap-4">
                          <TableActionIconButton icon={Eye} colorVariant="primary" />
                          <TableActionIconButton icon={Edit} colorVariant="success" />
                          <TableActionIconButton icon={Trash} colorVariant="error" />
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Menus & Links */}
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-foreground/80">Menus & Links</h3>
                    <div className="space-y-6">
                      <Card>
                        <CardHeader><CardTitle>User Menu</CardTitle></CardHeader>
                        <CardContent>
                          <div className="bg-slate-900 p-6 rounded-xl w-fit">
                            <AppUserMenu user={{ name: "Minh Nguyễn", avatar: "https://github.com/shadcn.png" }} onLogout={() => toast("Đã đăng xuất")} />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>Navigation Links & Logos</CardTitle></CardHeader>
                        <CardContent className="flex items-center gap-12">
                          <AppLogo />
                          <div className="flex gap-6">
                            <AppNavLink href="#">Khóa học</AppNavLink>
                            <AppNavLink href="#">Tin tức</AppNavLink>
                            <AppNavLink href="#">Liên hệ</AppNavLink>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>Notification Bell</CardTitle></CardHeader>
                        <CardContent className="flex items-center gap-4 bg-slate-900 p-6 rounded-xl w-fit">
                          <NotificationBell isDark={true} />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>AppMenubar</CardTitle><CardDescription>Thanh menu truyền thống (macOS style), hỗ trợ sub-menu lồng nhau.</CardDescription></CardHeader>
                        <CardContent className="space-y-4">
                          <AppMenubar menus={menubarData} appVariant="default" />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>AppNavigationMenu</CardTitle><CardDescription>Mega-menu trên header dành cho Desktop, hỗ trợ tự động dropdown content tuỳ biến.</CardDescription></CardHeader>
                        <CardContent className="space-y-4">
                          <AppNavigationMenu items={navMenuData} appVariant="glass" />
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Forms & Inputs */}
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-foreground/80">Forms & Inputs</h3>
                    <div className="space-y-6">
                      <Card>
                        <CardHeader><CardTitle>AppInput & AppPasswordInput</CardTitle></CardHeader>
                        <CardContent className="space-y-4 max-w-sm">
                          <AppInput id="demo-input" label="Tên đăng nhập" placeholder="Nhập tên đăng nhập..." icon={User} />
                          <AppPasswordInput id="demo-pwd" label="Mật khẩu" placeholder="Nhập mật khẩu..." forgotPasswordLink showStrength strength={{ score: 2, color: 'bg-warning', text: 'text-warning', label: 'Trung bình' }} value="123456" onChange={() => { }} />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>AppSearchInput</CardTitle></CardHeader>
                        <CardContent className="bg-slate-50 p-6 rounded-md">
                          <div className="max-w-md">
                            <AppSearchInput />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>AppCheckbox</CardTitle><CardDescription>Checkbox thông minh hỗ trợ các variant màu của hệ thống và tự quản lý Layout cùng Label/Description.</CardDescription></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <AppCheckbox id="chk1" label="Đồng ý với điều khoản" description="Bạn phải đồng ý với điều khoản sử dụng của Gnostica." />
                            <AppCheckbox id="chk2" appVariant="success" label="Đăng ký nhận tin nhắn" description="Chúng tôi sẽ gửi thông báo đến email của bạn." defaultChecked />
                            <AppCheckbox id="chk3" appVariant="warning" label="Tôi đã hiểu rủi ro" />
                            <AppCheckbox id="chk4" appVariant="error" label="Xóa toàn bộ dữ liệu" description="Hành động này không thể hoàn tác." />
                            <AppCheckbox id="chk-grad" appVariant="gradient" label="Premium Checkbox" description="Dùng cho các chức năng đặc biệt." defaultChecked />
                          </div>
                          <div className="space-y-4 border-l pl-8">
                            <h4 className="text-sm font-semibold text-muted-foreground mb-4">Responsive Sizes</h4>
                            <AppCheckbox id="sz-sm" appSize="sm" label="Kích thước Small (sm)" description="Dùng cho không gian chật hẹp." />
                            <AppCheckbox id="sz-md" appSize="default" label="Kích thước Mặc định (md)" defaultChecked />
                            <AppCheckbox id="sz-lg" appSize="lg" appVariant="accent" label="Kích thước Lớn (lg)" description="Nổi bật và dễ click trên màn hình cảm ứng." />
                            <div className="pt-4">
                                <AppCheckbox id="chk-disabled" label="Checkbox Vô hiệu hóa" description="Không thể tương tác." disabled />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>AppRadioGroup & AppSwitch</CardTitle><CardDescription>Các control lựa chọn tự động quản lý Layout Label/Description.</CardDescription></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-6">
                            <AppRadioGroup 
                              label="Vai trò của bạn"
                              options={[
                                { label: "Học viên", value: "student", description: "Người tham gia học các khóa học." },
                                { label: "Giảng viên", value: "teacher", description: "Người tạo và quản lý khóa học.", appVariant: "success" },
                                { label: "Quản trị viên", value: "admin", description: "Quản lý hệ thống (Disabled).", disabled: true }
                              ]}
                              defaultValue="student"
                            />
                            <div className="pt-4 border-t">
                              <AppRadioGroup 
                                label="Đánh giá"
                                orientation="horizontal"
                                appVariant="warning"
                                options={[
                                  { label: "1 Sao", value: "1" },
                                  { label: "2 Sao", value: "2" },
                                  { label: "3 Sao", value: "3" },
                                ]}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-6 border-l pl-8">
                            <AppSwitch 
                              id="sw1"
                              label="Thông báo Email" 
                              description="Nhận email khi có bài học mới." 
                              defaultChecked
                            />
                            <AppSwitch 
                              id="sw2"
                              appVariant="success"
                              label="Chế độ Dark Mode" 
                              description="Thay đổi giao diện sáng/tối." 
                            />
                            <AppSwitch 
                              id="sw3"
                              disabled
                              label="Tính năng Beta" 
                              description="Chưa khả dụng cho tài khoản của bạn." 
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>AppTextarea, AppSlider & AppDatePicker</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-6">
                            <AppTextarea 
                              id="ta1"
                              label="Giới thiệu bản thân" 
                              description="Viết một đoạn ngắn gọn về bạn."
                              placeholder="Tôi là một sinh viên yêu thích công nghệ..." 
                            />
                            <AppSlider 
                              label="Kinh nghiệm lập trình (Năm)" 
                              defaultValue={[2]} 
                              max={10} 
                              step={1} 
                              appVariant="success"
                              valueSuffix=" năm"
                            />
                          </div>
                          
                          <div className="space-y-6 border-l pl-8">
                            <AppDatePicker 
                              label="Ngày sinh" 
                              description="Chọn ngày sinh của bạn."
                            />
                            <AppDatePicker 
                              label="Ngày khai giảng" 
                              appVariant="glass"
                              description="Giao diện Glassmorphism."
                              date={new Date()}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* DATA-DRIVEN FORM SHOWCASE */}
                      <Card className="border-primary/50 shadow-md">
                        <CardHeader>
                          <CardTitle className="text-primary">Data-Driven Form (The Ultimate Form)</CardTitle>
                          <CardDescription>
                            Chỉ cần khai báo Zod Schema và sử dụng các thẻ `DataFormField` siêu ngắn gọn. 
                            Hệ thống tự động map Props, tự động Validate và đổ màu báo lỗi (Error State).
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <DataForm 
                            schema={complexFormSchema} 
                            defaultValues={{
                              fullName: "",
                              email: "",
                              password: "",
                              role: "",
                              bio: "",
                              experience: [2],
                              website: "",
                              otp: "",
                              terms: false,
                              newsletter: true
                            }}
                            onSubmit={(data) => {
                              alert("Đăng ký thành công!\n\n" + JSON.stringify(data, null, 2));
                            }}
                            className="space-y-6 max-w-2xl"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <DataFormField name="fullName" label="Họ và tên" placeholder="VD: Nguyễn Văn A" />
                              <DataFormField name="email" type="email" label="Email" placeholder="VD: email@example.com" />
                              
                              <DataFormField name="password" type="password" label="Mật khẩu" placeholder="Tạo mật khẩu" />
                              
                              <DataFormField 
                                name="role" 
                                type="select" 
                                label="Vai trò đăng ký" 
                                placeholder="Chọn vai trò..."
                                options={[
                                  { label: "Học viên", value: "student" },
                                  { label: "Giảng viên", value: "teacher" }
                                ]} 
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <DataFormField 
                                name="website" 
                                type="group" 
                                label="Trang web cá nhân" 
                                placeholder="gnostica.com" 
                                leftAddon="https://"
                              />

                              <DataFormField 
                                name="otp" 
                                type="otp" 
                                label="Mã xác thực (OTP)" 
                                description="Nhập 6 số được gửi về điện thoại."
                                maxLength={6}
                              />
                            </div>

                            <DataFormField 
                              name="bio" 
                              type="textarea" 
                              label="Giới thiệu ngắn (Tùy chọn)" 
                              placeholder="Kể một chút về bạn..." 
                            />

                            <DataFormField 
                              name="experience" 
                              type="slider" 
                              label="Kinh nghiệm lập trình" 
                              max={10} 
                              valueSuffix=" năm" 
                              appVariant="success"
                            />

                            <div className="space-y-4 pt-4 border-t">
                              <DataFormField 
                                name="newsletter" 
                                type="switch" 
                                label="Nhận bản tin" 
                                description="Nhận thông tin cập nhật hàng tuần từ Gnostica." 
                              />
                              
                              <DataFormField 
                                name="terms" 
                                type="checkbox" 
                                label="Đồng ý với điều khoản dịch vụ" 
                                description="Bạn bắt buộc phải đánh dấu ô này để đăng ký." 
                                appVariant="primary"
                              />
                            </div>

                            <div className="pt-2">
                              <AppButton type="submit" className="w-full">
                                Đăng ký tài khoản
                              </AppButton>
                            </div>
                          </DataForm>
                        </CardContent>
                      </Card>

                    </div>
                  </div>

                  {/* Layouts & Containers */}
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-foreground/80">Layouts & Containers</h3>
                    <div className="space-y-6">
                      <Card>
                        <CardHeader><CardTitle>AppResizable</CardTitle><CardDescription>Data-Driven Resizable Panels. Kéo thả để thay đổi kích thước các vùng không gian. Hỗ trợ chia màn hình lồng nhau (nested).</CardDescription></CardHeader>
                        <CardContent>
                          <div className="h-[400px]">
                            <AppResizable layout={resizableLayoutData} appVariant="glass" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-foreground/80">Navigation</h3>
                    <div className="space-y-6">
                      <Card>
                        <CardHeader><CardTitle>AppBreadcrumb</CardTitle></CardHeader>
                        <CardContent>
                          <AppBreadcrumb paths={[{ label: 'Khóa học', href: '#' }, { label: 'React JS' }]} />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>AppCommand & AppCommandPalette</CardTitle><CardDescription>Menu lệnh đa năng, hỗ trợ data-driven AppCommandPalette để tạo Search/Command menu nhanh chóng.</CardDescription></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Inline Command (Outline Variant)</h4>
                            <AppCommand appVariant="outline" className="max-w-md max-h-[300px]">
                              <AppCommandInput placeholder="Gõ lệnh hoặc tìm kiếm..." />
                              <AppCommandList>
                                <AppCommandEmpty>Không tìm thấy kết quả.</AppCommandEmpty>
                                <AppCommandGroup heading="Gợi ý">
                                  <AppCommandItem><CalendarIcon className="mr-2 size-4" />Lịch học</AppCommandItem>
                                  <AppCommandItem><User className="mr-2 size-4" />Hồ sơ</AppCommandItem>
                                </AppCommandGroup>
                                <AppCommandSeparator />
                                <AppCommandGroup heading="Cài đặt">
                                  <AppCommandItem><Settings className="mr-2 size-4" />Cài đặt chung<AppCommandShortcut>⌘S</AppCommandShortcut></AppCommandItem>
                                </AppCommandGroup>
                              </AppCommandList>
                            </AppCommand>
                          </div>
                          
                          <div className="space-y-4 border-l pl-8">
                            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Palette Dialog (Glass Variant)</h4>
                            <AppButton onClick={() => setCommandOpen(true)} className="w-full justify-start text-muted-foreground" variant="outline">
                              <Search className="mr-2 size-4" />
                              Tìm kiếm nhanh...
                              <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                <span className="text-xs">⌘</span>K
                              </kbd>
                            </AppButton>
                            <AppCommandPalette 
                              open={commandOpen} 
                              onOpenChange={setCommandOpen}
                              groups={[
                                {
                                  heading: "Hành động nhanh",
                                  items: [
                                    { label: "Tạo bài viết mới", icon: Plus, shortcut: "⌘N" },
                                    { label: "Quản lý khóa học", icon: Layers }
                                  ]
                                },
                                {
                                  heading: "Cá nhân",
                                  items: [
                                    { label: "Trang cá nhân", icon: User },
                                    { label: "Thanh toán", icon: CreditCard },
                                    { label: "Cài đặt", icon: Settings, shortcut: "⌘S" }
                                  ]
                                }
                              ]}
                            />
                            <p className="text-xs text-muted-foreground">Click vào input ảo phía trên để mở Command Palette (trải nghiệm Glassmorphism).</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Overlays */}
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-foreground/80">Overlays & Popups</h3>
                    <div className="space-y-6">
                      <Card>
                        <CardHeader><CardTitle>AppDialog</CardTitle><CardDescription>Hộp thoại tự động quản lý trạng thái, hỗ trợ giao diện Glassmorphism.</CardDescription></CardHeader>
                        <CardContent className="flex gap-4 flex-wrap">
                          <AppDialog 
                            title="Xác nhận xóa" 
                            description="Bạn có chắc chắn muốn xóa khóa học này không? Hành động này không thể hoàn tác."
                            trigger={<AppButton variant="destructive">Mở Dialog (Glass)</AppButton>}
                            footer={
                              <>
                                <AppButton variant="ghost">Hủy</AppButton>
                                <AppButton variant="destructive">Xóa khóa học</AppButton>
                              </>
                            }
                          />

                          <AppDialog 
                            title="Chỉnh sửa thông tin" 
                            description="Vui lòng nhập các thông tin cần thiết bên dưới."
                            appVariant="outline"
                            trigger={<AppButton variant="outline">Mở Dialog (Outline)</AppButton>}
                            footer={<AppButton>Lưu thay đổi</AppButton>}
                          >
                            <div className="space-y-4">
                              <AppInput id="dl-name" label="Tên hiển thị" placeholder="Nhập tên..." />
                              <AppInput id="dl-email" label="Email" placeholder="Nhập email..." />
                            </div>
                          </AppDialog>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>AppDropdownMenu</CardTitle><CardDescription>Data-driven Dropdown Menu dễ dàng sử dụng cho các nút tính năng.</CardDescription></CardHeader>
                        <CardContent className="flex gap-4">
                          <AppDropdownMenu 
                            label="Tài khoản của tôi"
                            trigger={<AppButton appVariant="category">Mở Menu (Glass) <ChevronRight className="ml-2 size-4" /></AppButton>}
                            items={[
                              { label: "Trang cá nhân", icon: User, shortcut: "⇧⌘P" },
                              { label: "Giỏ hàng", icon: ShoppingCart },
                              { type: "separator" },
                              { label: "Cài đặt", icon: Settings },
                              { label: "Đăng xuất", icon: LogOut, className: "text-error" }
                            ]}
                          />

                          <AppDropdownMenu 
                            appVariant="outline"
                            trigger={<AppIconButton icon={MoreVertical} />}
                            items={[
                              { label: "Sửa", icon: Edit },
                              { label: "Lưu trữ", icon: Cloud },
                              { type: "separator" },
                              { label: "Xóa", icon: Trash, className: "text-error" }
                            ]}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Layout & Content */}
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-foreground/80">Layout & Content</h3>
                    <div className="space-y-6">
                      <Card>
                        <CardHeader><CardTitle>AppAccordion</CardTitle><CardDescription>Dùng cho phần FAQ hoặc hiển thị nội dung thu gọn (có biến thể Separated)</CardDescription></CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-8">
                          <div>
                            <h4 className="font-semibold mb-4 text-sm text-muted-foreground uppercase">Default Variant</h4>
                            <AppAccordion
                              items={[
                                { title: "AppAccordion là gì?", content: "Là component được bọc lại từ Shadcn UI giúp truyền mảng dữ liệu (items) nhanh chóng hơn thay vì phải lặp thủ công." },
                                { title: "Nó có hỗ trợ Icon không?", content: "Có, bạn có thể truyền trực tiếp thuộc tính icon vào mỗi item." }
                              ]}
                            />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-4 text-sm text-muted-foreground uppercase">Separated Variant</h4>
                            <AppAccordion
                              variant="separated"
                              items={[
                                { icon: <MessageSquare className="w-5 h-5" />, title: "Làm sao để đăng ký khóa học?", content: "Bạn chỉ cần tạo tài khoản, nạp xu và click nút Mua khóa học." },
                                { icon: <CreditCard className="w-5 h-5" />, title: "Các phương thức thanh toán?", content: "Chúng tôi hỗ trợ chuyển khoản ngân hàng, mã QR và thẻ tín dụng." }
                              ]}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>AppAlert</CardTitle><CardDescription>Dùng cho các thông báo hệ thống với Semantic Colors (Success, Error, Warning, Info)</CardDescription></CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-4">
                          <AppAlert
                            variant="success"
                            title="Thành công"
                            description="Bạn đã đăng ký khóa học thành công."
                          />
                          <AppAlert
                            variant="error"
                            title="Lỗi thanh toán"
                            description="Số dư của bạn không đủ để thực hiện giao dịch này."
                          />
                          <AppAlert
                            variant="warning"
                            title="Cảnh báo"
                            description="Khóa học này sẽ hết hạn đăng ký trong 2 ngày tới."
                          />
                          <AppAlert
                            variant="info"
                            title="Thông tin"
                            description="Chương trình khuyến mãi giảm 50% sẽ bắt đầu vào ngày mai."
                          />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>AppAlertDialog</CardTitle><CardDescription>Dùng cho các popup xác nhận hành động với hệ thống Semantics Colors</CardDescription></CardHeader>
                        <CardContent className="flex flex-wrap gap-4">
                          <AppAlertDialog
                            variant="default"
                            trigger={<AppButton variant="outline">Xóa tệp</AppButton>}
                            title="Xóa tệp tin?"
                            description="Bạn có chắc muốn chuyển tệp này vào thùng rác không?"
                            confirmText="Tiếp tục"
                          />
                          <AppAlertDialog
                            variant="destructive"
                            trigger={<AppButton variant="destructive">Xóa tài khoản</AppButton>}
                            title="Xóa tài khoản vĩnh viễn?"
                            description="Tất cả dữ liệu của bạn sẽ bị xóa và không thể khôi phục."
                            confirmText="Xóa vĩnh viễn"
                          />
                          <AppAlertDialog
                            variant="warning"
                            trigger={<AppButton className="bg-warning hover:bg-warning/90 text-warning-foreground border-none">Thoát tiến trình</AppButton>}
                            title="Bạn muốn thoát?"
                            description="Tiến trình học tập của bạn chưa được lưu lại."
                            confirmText="Thoát"
                          />
                          <AppAlertDialog
                            variant="success"
                            trigger={<AppButton className="bg-success hover:bg-success/90 text-white border-none">Nộp bài thi</AppButton>}
                            title="Nộp bài thi?"
                            description="Bạn có chắc chắn muốn nộp bài thi ngay bây giờ không?"
                            confirmText="Nộp bài"
                          />
                          <AppAlertDialog
                            variant="info"
                            trigger={<AppButton className="bg-info hover:bg-info/90 text-white border-none">Xem thông tin</AppButton>}
                            title="Chính sách mới"
                            description="Chính sách bảo mật của chúng tôi đã được cập nhật."
                            confirmText="Đã hiểu"
                          />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>AppAspectRatio</CardTitle><CardDescription>Dùng để giữ đúng tỷ lệ khung hình cho ảnh, video trên mọi kích thước màn hình</CardDescription></CardHeader>
                        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div>
                            <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase">16:9 (Video)</h4>
                            <AppAspectRatio variant="video">
                              <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600" alt="Demo" />
                            </AppAspectRatio>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase">1:1 (Square)</h4>
                            <AppAspectRatio variant="square">
                              <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600" alt="Demo" />
                            </AppAspectRatio>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase">3:4 (Portrait)</h4>
                            <AppAspectRatio variant="portrait">
                              <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600" alt="Demo" />
                            </AppAspectRatio>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase">21:9 (Widescreen)</h4>
                            <AppAspectRatio variant="widescreen">
                              <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600" alt="Demo" />
                            </AppAspectRatio>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase">4:3 (Standard)</h4>
                            <AppAspectRatio variant="standard">
                              <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600" alt="Demo" />
                            </AppAspectRatio>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>AppAvatar</CardTitle><CardDescription>Hiển thị ảnh đại diện, auto-generate chữ cái đầu nếu không có ảnh, hỗ trợ trạng thái Online và hiển thị dạng nhóm (Group)</CardDescription></CardHeader>
                        <CardContent className="space-y-8">
                          <div>
                            <h4 className="font-semibold mb-4 text-sm text-muted-foreground uppercase">Kích thước (Sizes)</h4>
                            <div className="flex flex-wrap items-end gap-6">
                              <div className="flex flex-col items-center gap-2">
                                <AppAvatar size="sm" src="https://i.pravatar.cc/150?u=1" alt="Small User" />
                                <span className="text-xs text-muted-foreground">sm</span>
                              </div>
                              <div className="flex flex-col items-center gap-2">
                                <AppAvatar size="default" src="https://i.pravatar.cc/150?u=2" alt="Default User" />
                                <span className="text-xs text-muted-foreground">default</span>
                              </div>
                              <div className="flex flex-col items-center gap-2">
                                <AppAvatar size="lg" src="https://i.pravatar.cc/150?u=3" alt="Large User" />
                                <span className="text-xs text-muted-foreground">lg</span>
                              </div>
                              <div className="flex flex-col items-center gap-2">
                                <AppAvatar size="xl" src="https://i.pravatar.cc/150?u=4" alt="Extra Large" />
                                <span className="text-xs text-muted-foreground">xl</span>
                              </div>
                              <div className="flex flex-col items-center gap-2">
                                <AppAvatar size="2xl" src="https://i.pravatar.cc/150?u=5" alt="Huge User" />
                                <span className="text-xs text-muted-foreground">2xl</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-8">
                            <div>
                              <h4 className="font-semibold mb-4 text-sm text-muted-foreground uppercase">Trạng thái & Fallback</h4>
                              <div className="flex items-center gap-6">
                                <AppAvatar online size="lg" src="https://i.pravatar.cc/150?u=6" alt="Online User" />
                                <AppAvatar size="lg" alt="Nguyễn Văn A" />
                                <AppAvatar online size="lg" alt="Trần Thị B" />
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-4 text-sm text-muted-foreground uppercase">Avatar Group</h4>
                              <AppAvatarGroup
                                size="lg"
                                max={4}
                                users={[
                                  { src: "https://i.pravatar.cc/150?u=11", name: "User 1" },
                                  { src: "https://i.pravatar.cc/150?u=12", name: "User 2" },
                                  { src: "https://i.pravatar.cc/150?u=13", name: "User 3" },
                                  { src: "https://i.pravatar.cc/150?u=14", name: "User 4" },
                                  { src: "https://i.pravatar.cc/150?u=15", name: "User 5" },
                                  { src: "https://i.pravatar.cc/150?u=16", name: "User 6" },
                                ]}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>AppBadge</CardTitle><CardDescription>Nhãn dán (Label/Tag) hỗ trợ đầy đủ các biến thể màu Semantic, Soft mode và Icon</CardDescription></CardHeader>
                        <CardContent className="space-y-6">
                          <div>
                            <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase">Solid (Màu đặc)</h4>
                            <div className="flex flex-wrap gap-3">
                              <AppBadge variant="primary">Mới</AppBadge>
                              <AppBadge variant="secondary">Lưu trữ</AppBadge>
                              <AppBadge variant="success">Hoàn thành</AppBadge>
                              <AppBadge variant="warning">Chờ duyệt</AppBadge>
                              <AppBadge variant="error">Hủy bỏ</AppBadge>
                              <AppBadge variant="info">Thông tin</AppBadge>
                              <AppBadge variant="gradient">Pro</AppBadge>
                              <AppBadge variant="outline">Nháp</AppBadge>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase">Soft (Màu mờ)</h4>
                            <div className="flex flex-wrap gap-3">
                              <AppBadge soft variant="primary">Mới</AppBadge>
                              <AppBadge soft variant="secondary">Lưu trữ</AppBadge>
                              <AppBadge soft variant="success">Hoàn thành</AppBadge>
                              <AppBadge soft variant="warning">Chờ duyệt</AppBadge>
                              <AppBadge soft variant="error">Hủy bỏ</AppBadge>
                              <AppBadge soft variant="info">Thông tin</AppBadge>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase">Tích hợp Icon</h4>
                            <div className="flex flex-wrap gap-3">
                              <AppBadge variant="success" icon={CheckCircle2}>Đã xác thực</AppBadge>
                              <AppBadge soft variant="warning" icon={AlertTriangle}>Cần chú ý</AppBadge>
                              <AppBadge variant="gradient" icon={Info}>Khóa học Premium</AppBadge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>AppCalendar</CardTitle><CardDescription>Lịch chọn ngày đã được cấu hình mặc định tiếng Việt, tích hợp UI bóng đổ và bo góc</CardDescription></CardHeader>
                        <CardContent className="flex flex-col sm:flex-row gap-8 items-start">
                          <div>
                            <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase">Chế độ chọn 1 ngày (Single)</h4>
                            <AppCalendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                            />
                            <p className="mt-3 text-sm text-muted-foreground">
                              Ngày đang chọn: <strong className="text-primary">{date?.toLocaleDateString('vi-VN')}</strong>
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase">Chế độ chọn nhiều ngày (Multiple)</h4>
                            <AppCalendar
                              mode="multiple"
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>AppCarousel</CardTitle>
                          <CardDescription>Trình chiếu nội dung dạng trượt (Carousel/Slider) với các biến thể (variants) được thiết kế sẵn.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-12">
                          
                          <div>
                            <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase">Default Variant</h4>
                            <AppCarousel 
                              variant="default"
                              itemClassName="md:basis-1/2 lg:basis-1/3"
                              items={[1, 2, 3, 4, 5, 6]}
                              renderItem={(item) => (
                                <div className="p-1">
                                  <Card className="border-none shadow-sm">
                                    <CardContent className="flex aspect-square items-center justify-center p-6 bg-primary/5 rounded-xl border border-primary/10">
                                      <span className="text-4xl font-bold text-primary/40">{item}</span>
                                    </CardContent>
                                  </Card>
                                </div>
                              )}
                            />
                          </div>

                          <div>
                            <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase">Hero Variant (Có indicators)</h4>
                            <AppCarousel 
                              variant="hero"
                              items={[1, 2, 3]}
                              renderItem={(item) => (
                                <div className="w-full aspect-[21/9] bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center shadow-inner">
                                  <span className="text-3xl md:text-5xl font-bold text-primary">Hero Slide {item}</span>
                                </div>
                              )}
                            />
                          </div>

                          <div>
                            <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase">Sub Banner Variant</h4>
                            <AppCarousel 
                              variant="sub-banner"
                              items={[1, 2, 3, 4]}
                              renderItem={(item) => (
                                <div className="w-full aspect-[4/1] bg-secondary/30 rounded-xl flex items-center justify-center border border-secondary/50">
                                  <span className="text-xl font-medium text-secondary-foreground">Banner {item}</span>
                                </div>
                              )}
                            />
                          </div>

                          <div>
                            <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase">Centered Focus Variant</h4>
                            <AppCarousel 
                              variant="centered-focus"
                              items={[1, 2, 3, 4, 5]}
                              renderItem={(item, index, isActive) => (
                                <Card className="border-none shadow-sm h-40">
                                  <CardContent className={cn(
                                    "flex h-full items-center justify-center p-6 rounded-xl border transition-colors",
                                    isActive ? "bg-primary/10 border-primary" : "bg-muted border-transparent"
                                  )}>
                                    <span className={cn(
                                      "text-2xl font-bold",
                                      isActive ? "text-primary" : "text-muted-foreground"
                                    )}>Card {item}</span>
                                  </CardContent>
                                </Card>
                              )}
                            />
                          </div>

                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>AppChart</CardTitle>
                          <CardDescription>Trình diễn biểu đồ (Bar, Line, Area, Pie/Donut) dễ dàng thông qua wrapper kết hợp Shadcn UI & Recharts.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-12">
                          
                          <div>
                            <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase">Bar Chart (Biểu đồ cột)</h4>
                            <div className="w-full h-72">
                              <AppChart 
                                type="bar"
                                data={gnosticaChartData}
                                config={gnosticaChartConfig}
                                xAxisKey="month"
                                showLegend={true}
                              />
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase">Line Chart (Biểu đồ đường)</h4>
                            <div className="w-full h-72">
                              <AppChart 
                                type="line"
                                data={gnosticaChartData}
                                config={gnosticaChartConfig}
                                xAxisKey="month"
                                showLegend={true}
                              />
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase">Area Chart (Biểu đồ vùng)</h4>
                            <div className="w-full h-72">
                              <AppChart 
                                type="area"
                                data={gnosticaChartData}
                                config={gnosticaChartConfig}
                                xAxisKey="month"
                                showLegend={true}
                              />
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase">Donut Chart (Biểu đồ tròn rỗng)</h4>
                            <div className="w-full h-72 flex justify-center">
                              <AppChart 
                                type="donut"
                                data={pieChartData}
                                config={pieChartConfig}
                                nameKey="name"
                                dataKey="value"
                                showLegend={true}
                                className="w-1/2 min-w-[300px]"
                              />
                            </div>
                          </div>

                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>AppSelect</CardTitle>
                          <CardDescription>Hộp thoại lựa chọn với 2 chế độ: Đóng gói sẵn (Options Prop) và Linh hoạt (Composition).</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Sử dụng qua Prop (Tiện lợi)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <AppSelect
                                placeholder="Chọn một hệ điều hành..."
                                options={[
                                  { label: "Windows", value: "windows" },
                                  { label: "macOS", value: "macos" },
                                  { label: "Linux", value: "linux" },
                                  { label: "Ubuntu", value: "ubuntu", disabled: true }
                                ]}
                              />
                              <AppSelect
                                placeholder="Select đang bị vô hiệu hóa..."
                                disabled
                                options={[{ label: "Tùy chọn 1", value: "1" }]}
                              />
                              <AppSelect
                                placeholder="Select đang báo lỗi..."
                                error
                                options={[
                                  { label: "Lựa chọn sai", value: "wrong" }
                                ]}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Overlays & Utils */}
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-foreground/80">Overlays, Feedback & Utils</h3>
                    <div className="space-y-6">
                      
                      <Card>
                        <CardHeader><CardTitle>AppSeparator & AppScrollArea</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                          <AppSeparator text="Phân cách ngang" />
                          <AppScrollArea maxHeight={150} className="border p-4 bg-muted/20">
                            <h4 className="font-bold mb-2">Cuộn nội dung</h4>
                            <p className="text-muted-foreground leading-relaxed">
                              Jokester began sneaking into the castle in the middle of the night and leaving
                              jokes all over the place: under the king's pillow, in his soup, even tied to the
                              royal toilet seat. The king was furious, but he couldn't seem to stop Jokester.
                              And then, one day, the people of the kingdom discovered that the jokes left by
                              Jokester were so funny that they couldn't help but laugh. And once they
                              started laughing, they couldn't stop.
                            </p>
                          </AppScrollArea>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>AppSheet (Offcanvas)</CardTitle></CardHeader>
                        <CardContent>
                          <AppSheet 
                            trigger={<AppButton variant="outline">Mở Sidebar (Phải)</AppButton>}
                            title="Chỉnh sửa hồ sơ"
                            description="Thực hiện thay đổi hồ sơ của bạn ở đây. Bấm lưu để hoàn tất."
                          >
                            <div className="grid gap-4 py-4">
                              <AppInput id="name" label="Tên hiển thị" defaultValue="Nguyễn Văn A" />
                              <AppInput id="username" label="Tên người dùng" defaultValue="@nguyenvana" />
                            </div>
                          </AppSheet>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>AppSkeleton</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Preset: Profile</h4>
                            <AppSkeleton preset="profile" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Preset: Card</h4>
                            <AppSkeleton preset="card" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>AppToast (Sonner)</CardTitle></CardHeader>
                        <CardContent className="flex flex-wrap gap-4">
                          <AppButton variant="outline" onClick={() => AppToast.success("Cập nhật thành công!")}>Success Toast</AppButton>
                          <AppButton variant="outline" onClick={() => AppToast.error("Đã xảy ra lỗi hệ thống!")}>Error Toast</AppButton>
                          <AppButton variant="outline" onClick={() => AppToast.info("Có một tin nhắn mới.")}>Info Toast</AppButton>
                          <AppButton variant="outline" onClick={() => AppToast.warning("Tài khoản của bạn sắp hết hạn.")}>Warning Toast</AppButton>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>AppDrawer & AppCollapsible</CardTitle></CardHeader>
                        <CardContent className="flex flex-col gap-6">
                          <div>
                            <h4 className="text-sm font-semibold mb-2">AppDrawer</h4>
                            <AppDrawer>
                              <AppDrawerTrigger asChild>
                                <AppButton variant="outline">Mở ngăn kéo (Drawer)</AppButton>
                              </AppDrawerTrigger>
                              <AppDrawerContent>
                                <AppDrawerHeader>
                                  <AppDrawerTitle>Ngăn kéo ở dưới</AppDrawerTitle>
                                  <AppDrawerDescription>Nội dung này hiển thị từ dưới lên mượt mà.</AppDrawerDescription>
                                </AppDrawerHeader>
                                <div className="p-4 flex items-center justify-center h-24 bg-muted/50 rounded-lg m-4">
                                  Nội dung Drawer
                                </div>
                              </AppDrawerContent>
                            </AppDrawer>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold mb-2">AppCollapsible</h4>
                            <AppCollapsible>
                              <AppCollapsibleTrigger asChild>
                                <AppButton variant="ghost">Bấm để hiện/ẩn nội dung</AppButton>
                              </AppCollapsibleTrigger>
                              <AppCollapsibleContent className="p-4 bg-muted/20 rounded-md mt-2 text-sm">
                                Đây là nội dung bị ẩn đi, có hiệu ứng chuyển động mượt mà.
                              </AppCollapsibleContent>
                            </AppCollapsible>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>AppHoverCard & AppPopover & AppContextMenu</CardTitle></CardHeader>
                        <CardContent className="flex flex-wrap gap-4 items-center">
                          <AppHoverCard>
                            <AppHoverCardTrigger asChild>
                              <AppButton variant="outline">Hover Card</AppButton>
                            </AppHoverCardTrigger>
                            <AppHoverCardContent className="w-80">
                              <div className="flex justify-between space-x-4">
                                <AppAvatar src="https://github.com/vercel.png" alt="@nextjs" size="default" />
                                <div className="space-y-1">
                                  <h4 className="text-sm font-semibold">@nextjs</h4>
                                  <p className="text-sm">The React Framework – created and maintained by @vercel.</p>
                                </div>
                              </div>
                            </AppHoverCardContent>
                          </AppHoverCard>

                          <AppPopover>
                            <AppPopoverTrigger asChild>
                              <AppButton variant="outline">Mở Popover</AppButton>
                            </AppPopoverTrigger>
                            <AppPopoverContent>
                              <div className="space-y-2">
                                <h4 className="font-medium leading-none">Tuỳ chỉnh thông báo</h4>
                                <p className="text-sm text-muted-foreground">Bạn có thể đặt nhiều cài đặt tại đây.</p>
                              </div>
                            </AppPopoverContent>
                          </AppPopover>

                          <AppContextMenu>
                            <AppContextMenuTrigger className="flex h-[40px] w-[150px] items-center justify-center rounded-md border border-dashed text-sm">
                              Click chuột phải
                            </AppContextMenuTrigger>
                            <AppContextMenuContent>
                              <AppContextMenuItem>Quay lại</AppContextMenuItem>
                              <AppContextMenuItem>Tải lại</AppContextMenuItem>
                              <AppContextMenuItem>Lưu trang thành...</AppContextMenuItem>
                            </AppContextMenuContent>
                          </AppContextMenu>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>AppProgress</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                          <AppProgress value={33} />
                          <AppProgress value={66} indicatorClassName="bg-warning" heightClass="h-4" />
                          <AppProgress value={100} indicatorClassName="bg-success" />
                        </CardContent>
                      </Card>

                    </div>
                  </div>

                  {/* Additional Micro Components */}
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-foreground/80">Data Display, Inputs & Feedback</h3>
                    <div className="space-y-6">
                      <Card>
                        <CardHeader><CardTitle>AppCard (Micro)</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <AppCard appVariant="glass">
                            <AppCardHeader><AppCardTitle>Thẻ Glass</AppCardTitle></AppCardHeader>
                            <AppCardContent><p className="text-sm text-muted-foreground">Hiệu ứng trong suốt.</p></AppCardContent>
                          </AppCard>
                          <AppCard appVariant="outline">
                            <AppCardHeader><AppCardTitle>Thẻ Outline</AppCardTitle></AppCardHeader>
                            <AppCardContent><p className="text-sm text-muted-foreground">Chỉ có viền, không đổ bóng nền.</p></AppCardContent>
                          </AppCard>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader><CardTitle>AppNavigationMenu</CardTitle></CardHeader>
                        <CardContent>
                          <AppNavigationMenu 
                            items={[
                              { label: "Trang chủ", href: "#" },
                              { 
                                label: "Khóa học", 
                                links: [
                                  { title: "ReactJS Cơ bản", href: "#", description: "Học React từ con số 0" },
                                  { title: "NodeJS Nâng cao", href: "#", description: "Xây dựng API với Express" },
                                  { title: "NextJS Thực chiến", href: "#", description: "Xây dựng ứng dụng SSR" }
                                ]
                              },
                              {
                                label: "Giới thiệu",
                                content: (
                                  <div className="p-2 w-64 text-sm text-muted-foreground">
                                    <h4 className="font-semibold text-foreground mb-1">Về Gnostica</h4>
                                    <p>Nền tảng học tập trực tuyến kết nối kiến thức và người học một cách toàn diện.</p>
                                  </div>
                                )
                              }
                            ]}
                          />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>AppPagination</CardTitle></CardHeader>
                        <CardContent>
                          <AppPagination 
                            currentPage={5}
                            totalPages={10}
                            onPageChange={(page) => console.log("Changed to page", page)}
                          />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>AppTable (Micro)</CardTitle></CardHeader>
                        <CardContent>
                          <MicroAppTable 
                            columns={[
                              { key: "id", label: "ID" },
                              { key: "status", label: "Trạng thái" }
                            ]}
                            data={[
                              { id: "INV001", status: "Đã thanh toán" },
                              { id: "INV002", status: "Chờ xử lý" }
                            ]}
                          />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>AppTabs</CardTitle></CardHeader>
                        <CardContent>
                          <AppTabs 
                            tabs={[
                              { value: "a", label: "Tab A", content: <div className="p-4 bg-muted/20 rounded-md text-sm mt-2">Nội dung Tab A</div> },
                              { value: "b", label: "Tab B", content: <div className="p-4 bg-muted/20 rounded-md text-sm mt-2">Nội dung Tab B</div> }
                            ]}
                          />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>AppTextarea</CardTitle></CardHeader>
                        <CardContent>
                          <AppTextarea label="Nội dung" placeholder="Nhập văn bản của bạn..." description="Có thể mở rộng khung nhập liệu" />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>AppToggle & AppToggleGroup</CardTitle></CardHeader>
                        <CardContent className="flex flex-col gap-6">
                          <div>
                            <h4 className="text-sm font-semibold mb-2">AppToggle</h4>
                            <div className="flex gap-2">
                              <AppToggle>Bật/Tắt (Mặc định)</AppToggle>
                              <AppToggle variant="outline">Bật/Tắt (Outline)</AppToggle>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold mb-2">AppToggleGroup</h4>
                            <AppToggleGroup 
                              type="multiple"
                              items={[
                                { value: "a", label: "A" },
                                { value: "b", label: "B" },
                                { value: "c", label: "C" },
                              ]}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>AppTooltip</CardTitle></CardHeader>
                        <CardContent>
                          <AppTooltip content="Đây là thông tin bổ sung khi hover">
                            <AppButton variant="outline">Di chuột vào đây</AppButton>
                          </AppTooltip>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                </div>
              </section>

              {/* SECTION 3: COMPOSITE COMPONENTS */}
              <section className="mt-12">
                <h2 className="text-3xl font-extrabold mb-6 border-b pb-2 text-primary">3. Composite Components</h2>
                <div className="space-y-10">

                  {/* Data Display */}
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-foreground/80">Data Display & Cards</h3>
                    <div className="space-y-6">
                      <Card>
                        <CardHeader><CardTitle>AppCard & CourseCardHorizontal</CardTitle></CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-4">
                          <div className="max-w-xs"><CourseCard /></div>
                          <div className="flex flex-col gap-4">
                            <CourseCardHorizontal />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>ForumPostCard</CardTitle></CardHeader>
                        <CardContent>
                          <ForumPostCard post={{ id: 1, title: 'Hướng dẫn sử dụng React hooks', content: 'Trong bài viết này chúng ta sẽ tìm hiểu về các hooks cơ bản trong React...', author: { name: 'Admin', avatar: '', status: 'online' }, category: 'Lập trình', tags: ['React', 'Frontend'], createdAt: '2 giờ trước', stats: { replies: 5, views: 120, likes: 12 }, isHot: true }} />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>AppTable</CardTitle></CardHeader>
                        <CardContent>
                          <DataTable
                            columns={[
                              { key: "id", header: "ID", width: "50px" },
                              { key: "name", header: "Học viên" },
                              { key: "course", header: "Khóa học" },
                            ]}
                            data={[
                              { id: 1, name: "Minh Nguyễn", course: "React JS" },
                              { id: 2, name: "Thanh Trần", course: "Node JS" }
                            ]}
                            pagination={{ currentPage: 1, totalPages: 1, totalItems: 2 }}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Filters & Search */}
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-foreground/80">Filters, Search & Date Pickers</h3>
                    <div className="grid grid-cols-1 gap-6">
                      <Card>
                        <CardHeader><CardTitle>DataFilter</CardTitle></CardHeader>
                        <CardContent>
                          <DataFilter
                            searchQuery=""
                            onSearchChange={() => {}}
                            searchPlaceholder="Tìm kiếm học viên..."
                            filterValue="all"
                            onFilterChange={() => {}}
                            filterOptions={[
                              { label: "Tất cả", value: "all" },
                              { label: "Hoạt động", value: "active" },
                            ]}
                            dateRange={{ from: undefined, to: undefined }}
                            onDateRangeChange={() => {}}
                          />
                        </CardContent>
                      </Card>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader><CardTitle>DataFilterSidebar</CardTitle></CardHeader>
                          <CardContent>
                            <DataFilterSidebar 
                              categories={[{ id: 1, name: "Khóa học React", slug: "react", courses: 5 }]}
                              selectedFilters={{ categorySlug: null, level: "all" }}
                              onFilterChange={() => {}}
                            />
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader><CardTitle>DataFilterSidebarChecklist</CardTitle></CardHeader>
                          <CardContent>
                            <DataFilterSidebarChecklist
                              items={["Trạng thái: Hoạt động", "Trạng thái: Đã ẩn"]}
                              selectedItems={[]}
                              onItemToggle={() => {}}
                              dateRange={{ from: undefined, to: undefined }}
                              onDateRangeChange={() => {}}
                            />
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardHeader><CardTitle>DataFilterDropdownChecklist</CardTitle></CardHeader>
                        <CardContent>
                          <DataFilterDropdownChecklist
                            title="Lọc theo trạng thái"
                            items={[
                              { label: "Đã duyệt", value: "approved" },
                              { label: "Chờ xử lý", value: "pending" },
                              { label: "Bị từ chối", value: "rejected" }
                            ]}
                            selectedItems={["pending"]}
                            onItemToggle={() => {}}
                            onClear={() => {}}
                          />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>AppDatePicker & AppDateRangePicker</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <AppDatePicker label="Ngày sinh" placeholder="Chọn ngày sinh" date={new Date()} onSelect={() => {}} />
                          <AppDateRangePicker label="Chu kỳ" date={{ from: new Date(), to: new Date() }} onSelect={() => {}} />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>ChartDateFilters</CardTitle></CardHeader>
                        <CardContent>
                          <ChartDateFilters onDateChange={() => {}} onPresetChange={() => {}} />
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Feedback & Interactivity */}
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-foreground/80">Feedback & Interactivity</h3>
                    <div className="space-y-6">
                      <Card>
                        <CardHeader><CardTitle>CommentCard</CardTitle></CardHeader>
                        <CardContent>
                          <div className="max-w-2xl">
                            <CommentCard
                              comment={{
                                id: 1,
                                content: '<p>Khóa học này rất tuyệt vời, giảng viên giảng dễ hiểu!</p>',
                                author: { name: 'Học viên A', avatar: '' },
                                createdAt: '1 giờ trước',
                                replies: [
                                  { id: 2, content: '<p>Cảm ơn bạn đã nhận xét.</p>', author: { name: 'Giảng viên', avatar: '', role: 'Instructor' }, createdAt: '30 phút trước', isAccepted: true }
                                ]
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader><CardTitle>DataFilter</CardTitle></CardHeader>
                        <CardContent>
                          <DataFilter
                            searchQuery=""
                            onSearchChange={() => {}}
                            searchPlaceholder="Tìm kiếm học viên..."
                            filterValue="all"
                            onFilterChange={() => {}}
                            filterOptions={[
                              { label: "Tất cả", value: "all" },
                              { label: "Hoạt động", value: "active" },
                            ]}
                            dateRange={{ from: undefined, to: undefined }}
                            onDateRangeChange={() => {}}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                </div>
              </section>

            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Showcase
