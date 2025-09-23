---
title: USB 协议基础（一）
date: 2025-09-22 22:19:32
categories: Code
tags:
    - USB

id: USB-1
cover: "https://i0.wp.com/uxiaohan.github.io/v2/2024/07/1721643791.png"
recommend: true
---

## USB 简介

USB 是什么呢？USB，全称为通用串行总线（Universal Serial Bus），是一种用于连接计算机与外部设备的标准接口。它的设计目标是简化个人电脑和设备的连接，提供高速数据传输，并支持热插拔功能，让用户能即插即用。现在 USB 设备已经无处不在，只要和计算机打交道，基本上都离不开 USB。

USB 由 USB-IF（USB Implementers Forum）组织进行管理和推广，致力于推动 USB 技术的发展和普及。USB 标准经历了多个版本的演进，从最初的 USB 1.0 到现在的 USB4，每个版本都带来了更高的传输速度和更多的功能。由于 USB 是主从结构的通信协议，所有的 USB 设备都必须连接到主机，设备和设备之间，主机和主机之间是不能直接通信的。为了解决这个问题，还出现了 USB OTG（On-The-Go）技术，使得某些设备可以在主机和设备之间切换角色。

本文将介绍 USB 的基础知识，包括 USB 的拓扑结构、电气特性、插入检测机制、描述符、传输类型、设备的枚举过程、包结构和传输过程以及标准请求等内容。所使用的标准是 USB 2.0。为什么是 USB 2.0 呢？第一，它足够地简单，对身心健康的影响不是很大，第二，它足够地普及，绝大多数的 USB 设备都支持 USB 2.0。

## USB 拓扑结构

USB（Universal Serial Bus）是一种主从结构的接口标准，主机叫作 Host，外部设备叫作 Device。在标准中，USB 设备分为三种类型：

1. **主机（Host）**：通常是计算机或其他控制设备，只负责管理 USB 设备的通信。
2. **设备（Device）**：连接到主机的外部设备，如键盘、鼠标、打印机等。
3. **集线器（Hub）**：用于扩展 USB 接口数量的设备，可以连接多个 USB 设备。

USB 拓扑结构采用树形结构，主机位于树的根部，集线器和设备则作为树的分支和叶子。USB 2.0 规定，集线器最多为 6 层。理论上，一个主机最多连接 127 个设备，因为每个 USB 设备都有一个 7 bit（0~127，0地址保留给未初始化设备） 的唯一地址用来标识自己。

## USB 插入检测机制

USB 很重要的一个特性是热插拔（Hot Plugging），也就是在设备运行过程中可以随时插入或拔出 USB 设备，而不会对系统造成损害。那么主机是如何检测到 USB 设备的插入的呢？

USB 插入检测机制是指主机在 USB 设备插入或拔出时能够及时感知并作出相应处理的能力。USB 设备在插入时，主机会通过检测 USB 总线上的电压变化来判断设备的插入状态。当设备插入时，主机会向设备发送初始化命令，完成设备的枚举过程。

## USB 描述符

USB 只是一个通信协议，它并不关心设备的具体功能和实现，USB 总线驱动程序并不知道一个设备具体要如何操作，有哪些行为，具体的功能要由设备来决定。那么为了让主机能够识别和管理不同类型的 USB 设备，USB 设备需要向主机提供一组描述其自身信息的数据结构，这些数据结构就叫做 USB 描述符（USB Descriptor）。

USB 描述符是 USB 设备用来向主机提供其信息的结构化数据，USB 描述符包括：

1. **设备描述符（Device Descriptor）**：一个 USB 设备必须包含一个设备描述符，它提供了设备的基本信息，如 USB 版本、设备类型、厂商 ID(VID)、产品 ID(PID) 等。
```c
typedef struct {
    uint8_t  bLength;            /* 0  整个描述符长度（固定 18 字节） */
    uint8_t  bDescriptorType;    /* 1  描述符类型：0x01 = DEVICE */
    uint16_t bcdUSB;             /* 2  USB 规范版本号（BCD，例如 0x0200 = USB 2.00） */
    uint8_t  bDeviceClass;       /* 4  设备类代码 */
    uint8_t  bDeviceSubClass;    /* 5  设备子类代码 */
    uint8_t  bDeviceProtocol;    /* 6  设备协议代码 */
    uint8_t  bMaxPacketSize0;    /* 7  端点 0 最大包长（8/16/32/64） */
    uint16_t idVendor;           /* 8  厂商 ID（USB-IF 分配） */
    uint16_t idProduct;          /* 10 产品 ID（厂商自定义） */
    uint16_t bcdDevice;          /* 12 设备版本号（BCD） */
    uint8_t  iManufacturer;      /* 14 厂商字符串索引 */
    uint8_t  iProduct;           /* 15 产品字符串索引 */
    uint8_t  iSerialNumber;      /* 16 序列号字符串索引 */
    uint8_t  bNumConfigurations; /* 17 配置数量 */
} DeviceDescriptor;
```

2. **配置描述符（Configuration Descriptor）**：一个设备可以有多个配置描述符，每个配置描述符描述了设备的一种工作模式，包括接口和端点的数量和类型等信息。
```c
typedef struct {
    uint8_t  bLength;             /* 0 描述符长度，固定 9 字节 */
    uint8_t  bDescriptorType;     /* 1 0x02 = CONFIGURATION */
    uint16_t wTotalLength;        /* 2 本配置下所有描述符的总长度（配置+接口+端点+类/厂商特定） */
    uint8_t  bNumInterfaces;      /* 4 本配置支持的接口数量 */
    uint8_t  bConfigurationValue; /* 5 作为 SetConfiguration() 的参数值 */
    uint8_t  iConfiguration;      /* 6 描述该配置的字符串描述符索引 */
    uint8_t  bmAttributes;        /* 7 配置属性 bitmap */
    uint8_t  bMaxPower;           /* 8 最大功耗（单位：2 mA） */
} ConfigurationDescriptor;
```

3. **接口描述符（Interface Descriptor）**：一个配置中可以有多个接口，每个接口描述接口编号、接口的端点数量、接口使用的类、子类、协议。
```c
typedef struct {
    uint8_t  bLength;            /* 0 描述符长度，固定 9 字节 */
    uint8_t  bDescriptorType;    /* 1 0x04 = INTERFACE */
    uint8_t  bInterfaceNumber;   /* 2 接口编号（从 0 开始） */
    uint8_t  bAlternateSetting;  /* 3 备用设置值 */
    uint8_t  bNumEndpoints;      /* 4 本接口使用的端点数（不含 EP0） */
    uint8_t  bInterfaceClass;    /* 5 接口类代码 */
    uint8_t  bInterfaceSubClass; /* 6 接口子类代码 */
    uint8_t  bInterfaceProtocol; /* 7 接口协议代码 */
    uint8_t  iInterface;         /* 8 接口字符串描述符索引 */
} InterfaceDescriptor;
```

4. **端点描述符（Endpoint Descriptor）**：一个接口中又可以有多个端点，用于描述设备的端点地址、端点属性、最大包长等。
```c
typedef struct {
    uint8_t  bLength;          /* 0 描述符长度，固定 7 字节 */
    uint8_t  bDescriptorType;  /* 1 0x05 = ENDPOINT */
    uint8_t  bEndpointAddress; /* 2 端点地址（bit7=方向，bit3~0=端点号） */
    uint8_t  bmAttributes;     /* 3 端点属性（传输类型、同步/用法等） */
    uint16_t wMaxPacketSize;   /* 4 最大包长（含高速附加事务位） */
    uint8_t  bInterval;        /* 6 轮询间隔 / NAK 率 */
} EndpointDescriptor;
```

5. **字符串描述符（String Descriptor）**：提供设备的字符串信息，如制造商名称、产品名称等。

6. **设备限定描述符（Device Qualifier Descriptor）**：USB 2.0 引入的一种“速率切换辅助”描述符，只在“当前速率 ≠ 最高支持速率”时才生效，相当于告诉主机：如果我把总线换到另一种速度，设备描述符里哪些字段会变、会变成什么值。
```c
typedef struct {
    uint8_t  bLength;            /* 0 描述符长度，固定 10 字节 */
    uint8_t  bDescriptorType;    /* 1 0x06 = DEVICE_QUALIFIER */
    uint16_t bcdUSB;             /* 2 另一速率下的 USB 版本号（BCD） */
    uint8_t  bDeviceClass;       /* 4 另一速率下的设备类 */
    uint8_t  bDeviceSubClass;    /* 5 另一速率下的子类 */
    uint8_t  bDeviceProtocol;    /* 6 另一速率下的协议 */
    uint8_t  bMaxPacketSize0;    /* 7 另一速率下端点 0 最大包长 */
    uint8_t  bNumConfigurations; /* 8 另一速率下的配置总数 */
    uint8_t  bReserved;          /* 9 保留，必须为 0 */
} DeviceQualifierDescriptor;
```


7. **其他速度配置描述符（Other Speed Configuration Descriptor）**：描述设备在其他速度下的配置选项。
```c
typedef struct {
    uint8_t  bLength;             /* 0 描述符长度，固定 9 字节 */
    uint8_t  bDescriptorType;     /* 1 0x07 = OTHER_SPEED_CONFIGURATION */
    uint16_t wTotalLength;        /* 2 该速度下所有描述符总长度 */
    uint8_t  bNumInterfaces;      /* 4 该速度支持的接口数量 */
    uint8_t  bConfigurationValue; /* 5 SetConfiguration() 参数值 */
    uint8_t  iConfiguration;      /* 6 描述该配置的字符串索引 */
    uint8_t  bmAttributes;        /* 7 属性 bitmap（同 Configuration Descriptor） */
    uint8_t  bMaxPower;           /* 8 该速度下最大总线功耗（单位：2 mA） */
} OtherSpeedConfigurationDescriptor;
```

说了半天，可能还没弄懂这些描述符是干嘛的，一下子列出来那么多，确实有点让人眼花缭乱。现在把主干部分抽出来，主要是**设备描述符**、**配置描述符**、**接口描述符**和**端点描述符**，用鼠标设备举个例子，一个 USB 鼠标，需要有一个设备描述符，主机通过这个设备地址来访问设备，然后在鼠标的内部，还会细分，分成多个端点，比如一个端点用来传输鼠标的移动数据，一个端点用来传输鼠标的按键信息，也就是说，主机光依靠设备地址还不够，还需要一个端点地址，才能和鼠标进行通信。

至于配置和接口，是为了更好地组织和管理这些端点才抽象出来的概念，一个设备下可以有多个配置，但是同一时刻只能启用一个配置，也就是说当我们需要不同的功能时，只要切换配置来实现即可。而一个配置下又可以有多个接口，接口就是对设备功能的进一步划分，比如一个多功能打印机，既有打印功能，也有扫描功能，那么就可以把打印功能和扫描功能分别放在不同的接口下，这样主机就可以根据需要选择不同的接口来使用设备的不同功能。有多个接口的 USB 设备，我们把它叫做复合设备（Composite Device）。

简单来说，USB 设备描述符就像是设备的身份证，告诉主机这个设备是谁、能做什么、怎么和它交流。配置描述符就像是设备的菜单，告诉主机设备有哪些工作模式和功能选项。接口描述符就像是设备的功能区，告诉主机设备有哪些具体的功能模块。端点描述符就像是设备的通信端口，告诉主机如何和设备进行数据交换。

## USB 传输类型

USB 支持多种传输类型，以满足不同设备和应用的需求。主要的传输类型包括：
1. **控制传输（Control Transfer）**：用于设备配置和命令传输，通常用于设备初始化和状态查询。
2. **批量传输（Bulk Transfer）**：用于大数据量的传输，如文件传输，具有高吞吐量但不保证延迟。
3. **中断传输（Interrupt Transfer）**：用于周期性的数据传输，如键盘和鼠标输入，具有较低延迟。
4. **等时传输（Isochronous Transfer）**：用于实时数据传输，如音频和视频流，保证数据的传输时效性。

@TODO

## USB 设备的枚举过程
@TODO


## USB 包结构和传输过程

USB 包（Packet）是 USB 通信的基本单位，每个包包含了特定的信息，用于在主机和设备之间传输数据。USB 包结构主要包括以下几个部分：
1. **同步字段（Sync Field）**：用于同步发送和接收设备的时钟。
2. **包标识符（Packet Identifier, PID）**：指示包的类型，如数据包、握手包等。
3. **地址字段（Address Field）**：包含设备地址和端点号，用于标识目标设备和端点。
4. **数据字段（Data Field）**：包含实际传输的数据，长度可变。
5. **CRC 校验（CRC Check）**：用于检测数据传输中的错误。
6. **结束字段（End Field）**：标志包的结束。

USB 包的传输过程包括以下几个步骤：
1. 主机向设备发送请求，设备准备数据。
2. 设备将数据打包成 USB 包，并添加相应的头部信息。
3. 设备通过 USB 总线将数据包发送给主机。
4. 主机接收数据包，并进行解析和处理。
5. 主机向设备发送确认包，表示数据已成功接收。
6. 如果数据传输过程中出现错误，主机会请求设备重新发送数据包。

@TODO

## USB 标准请求

USB 标准请求是指在 USB 通信过程中，主机向设备发送的预定义命令，用于控制设备的行为和获取设备信息。常见的 USB 标准请求包括：

1. **GET_STATUS**：获取设备、接口或端点的状态信息。
2. **CLEAR_FEATURE**：清除设备、接口或端点的特定功能。
3. **SET_FEATURE**：设置设备、接口或端点的特定功能。
4. **SET_ADDRESS**：为设备分配一个唯一的地址。
5. **GET_DESCRIPTOR**：获取设备的描述符信息。
6. **SET_DESCRIPTOR**：设置设备的描述符信息（较少使用）。
7. **GET_CONFIGURATION**：获取当前设备的配置值。
8. **SET_CONFIGURATION**：设置设备的配置值。
9. **GET_INTERFACE**：获取接口的当前备用设置。
10. **SET_INTERFACE**：设置接口的备用设置。
11. **SYNCH_FRAME**：同步帧，用于等时传输。

@TODO