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
  ShoppingCart, Eye, Edit, Trash
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
  SimpleButton, OutlineGradientButton, GhostButton, IconLabelButton, 
  HorizontalIconLabelButton, AppIconButton, AppHeaderButton, AppHamburgerButton, 
  AppNavLink, AppUserMenu, CategoryButton, AppLogo, TableActionIconButton 
} from "@/components/common/micro/AppButton"
import AppCard, { CourseCardHorizontal, ForumPostCard } from "@/components/common/composite/AppCard"
import AppInput, { AppPasswordInput } from "@/components/common/micro/AppInput"
import AppSearchInput from "@/components/common/micro/AppSearchInput"
import CommentCard from "@/components/common/composite/CommentCard"
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb"
import AppTable from "@/components/common/composite/AppTable"


const formSchema = z.object({
  username: z.string().min(2, { message: "Username must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
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

const Showcase = () => {
  const [date, setDate] = useState(new Date())
  const [hamburgerOpen, setHamburgerOpen] = useState(false)

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
              <Card><CardHeader><CardTitle>Alert</CardTitle></CardHeader><CardContent className="space-y-4"><Alert><AlertCircle className="w-4 h-4"/><AlertTitle>Info</AlertTitle><AlertDescription>Alert description</AlertDescription></Alert><Alert variant="destructive"><AlertCircle className="w-4 h-4"/><AlertTitle>Error</AlertTitle><AlertDescription>Destructive alert description</AlertDescription></Alert></CardContent></Card>
              <Card><CardHeader><CardTitle>Alert Dialog</CardTitle></CardHeader><CardContent><AlertDialog><AlertDialogTrigger asChild><Button variant="outline">Delete</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction>Confirm</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></CardContent></Card>
              <Card><CardHeader><CardTitle>Avatar</CardTitle></CardHeader><CardContent><Avatar><AvatarImage src="https://github.com/shadcn.png" /><AvatarFallback>CN</AvatarFallback></Avatar></CardContent></Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">B</h2>
            <div className="grid gap-6 2xl:grid-cols-2">
              <Card><CardHeader><CardTitle>Badge</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2"><Badge>Default</Badge><Badge variant="secondary">Secondary</Badge><Badge variant="destructive">Destructive</Badge><Badge variant="outline">Outline</Badge><Badge variant="ghost">Ghost</Badge></CardContent></Card>
              <Card><CardHeader><CardTitle>Button</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2"><Button>Default</Button><Button variant="secondary">Secondary</Button><Button variant="destructive">Destructive</Button><Button variant="outline">Outline</Button><Button variant="ghost">Ghost</Button><Button variant="link">Link</Button></CardContent></Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">C</h2>
            <div className="grid gap-6 2xl:grid-cols-2">
              <Card><CardHeader><CardTitle>Calendar</CardTitle></CardHeader><CardContent><Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border mx-auto w-fit" /></CardContent></Card>
              <Card><CardHeader><CardTitle>Checkbox</CardTitle></CardHeader><CardContent className="flex items-center gap-2"><Checkbox id="c1" /><label htmlFor="c1" className="text-sm">Accept terms</label></CardContent></Card>
              <Card className="2xl:col-span-2"><CardHeader><CardTitle>Chart</CardTitle></CardHeader><CardContent><ChartContainer config={chartConfig} className="h-[200px] w-full"><BarChart data={chartData}><CartesianGrid vertical={false}/><XAxis dataKey="month" /><Bar dataKey="desktop" fill="var(--color-desktop)" radius={4}/></BarChart></ChartContainer></CardContent></Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">D</h2>
            <div className="grid gap-6 2xl:grid-cols-2">
              <Card><CardHeader><CardTitle>Dialog</CardTitle></CardHeader><CardContent><Dialog><DialogTrigger asChild><Button>Open</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Title</DialogTitle></DialogHeader>Content</DialogContent></Dialog></CardContent></Card>
              <Card><CardHeader><CardTitle>Dropdown</CardTitle></CardHeader><CardContent><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline">Menu</Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>Profile</DropdownMenuItem></DropdownMenuContent></DropdownMenu></CardContent></Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">F</h2>
            <Card><CardHeader><CardTitle>Form</CardTitle></CardHeader><CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="username" render={({field}) => (<FormItem><FormLabel>Username</FormLabel><FormControl><Input {...field}/></FormControl></FormItem>)} />
                  <Button type="submit">Submit</Button>
                </form>
              </Form>
            </CardContent></Card>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">I</h2>
            <div className="grid gap-6 2xl:grid-cols-2">
              <Card><CardHeader><CardTitle>Input</CardTitle></CardHeader><CardContent><Input placeholder="Email..." /></CardContent></Card>
              <Card><CardHeader><CardTitle>Input OTP</CardTitle></CardHeader><CardContent><InputOTP maxLength={4}><InputOTPGroup><InputOTPSlot index={0}/><InputOTPSlot index={1}/></InputOTPGroup><InputOTPSeparator/><InputOTPGroup><InputOTPSlot index={2}/><InputOTPSlot index={3}/></InputOTPGroup></InputOTP></CardContent></Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">S</h2>
            <div className="grid gap-6 2xl:grid-cols-2">
              <Card><CardHeader><CardTitle>Select</CardTitle></CardHeader><CardContent><Select><SelectTrigger><SelectValue placeholder="Theme" /></SelectTrigger><SelectContent><SelectItem value="light">Light</SelectItem><SelectItem value="dark">Dark</SelectItem></SelectContent></Select></CardContent></Card>
              <Card><CardHeader><CardTitle>Switch</CardTitle></CardHeader><CardContent className="flex items-center gap-2"><Switch id="s1" /><Label htmlFor="s1">Airplane mode</Label></CardContent></Card>
              <Card><CardHeader><CardTitle>Slider</CardTitle></CardHeader><CardContent><Slider defaultValue={[50]} max={100} step={1} /></CardContent></Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">T</h2>
            <div className="grid gap-6 2xl:grid-cols-2">
              <Card className="2xl:col-span-2"><CardHeader><CardTitle>Table</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>INV001</TableCell><TableCell>Paid</TableCell></TableRow></TableBody></Table></CardContent></Card>
              <Card><CardHeader><CardTitle>Tabs</CardTitle></CardHeader><CardContent><Tabs defaultValue="a"><TabsList><TabsTrigger value="a">A</TabsTrigger><TabsTrigger value="b">B</TabsTrigger></TabsList><TabsContent value="a">Content A</TabsContent><TabsContent value="b">Content B</TabsContent></Tabs></CardContent></Card>
              <Card><CardHeader><CardTitle>Toggle</CardTitle></CardHeader><CardContent className="flex gap-2"><Toggle>Default</Toggle><Toggle variant="outline">Outline</Toggle></CardContent></Card>
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
                    <CardHeader><CardTitle>Base Buttons</CardTitle><CardDescription>Các loại nút bấm tùy chỉnh màu sắc thương hiệu</CardDescription></CardHeader>
                    <CardContent className="flex flex-wrap gap-4">
                      <SimpleButton>Simple Button</SimpleButton>
                      <OutlineGradientButton>Outline Gradient</OutlineGradientButton>
                      <GhostButton>Ghost Button</GhostButton>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>Header & Navigation Buttons</CardTitle><CardDescription>Dùng cho thanh điều hướng và menu (Background tối mô phỏng Header)</CardDescription></CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex flex-wrap items-center gap-6 bg-slate-900 p-6 rounded-xl border">
                        <IconLabelButton icon={User} badge={2}>Đăng nhập</IconLabelButton>
                        <HorizontalIconLabelButton icon={ShoppingCart}>Giỏ hàng</HorizontalIconLabelButton>
                        <AppIconButton icon={Bell} badge={5} />
                        <AppHeaderButton icon={Mail} label="Inbox" badge={1} />
                        <div className="ml-auto flex items-center gap-4">
                          <CategoryButton><Layers className="w-5 h-5"/> Danh mục</CategoryButton>
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
                      <AppPasswordInput id="demo-pwd" label="Mật khẩu" placeholder="Nhập mật khẩu..." forgotPasswordLink showStrength strength={{ score: 2, color: 'bg-warning', text: 'text-warning', label: 'Trung bình' }} value="123456" onChange={()=>{}} />
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
                      <div className="max-w-xs"><AppCard /></div>
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
                      <AppTable 
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
