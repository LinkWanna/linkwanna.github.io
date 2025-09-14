---
title: ARM GICv3 基础了解
date: 2025-08-13 10:19:32
categories: Code
tags:
  - ARM

id: arm-gicv3-basic
cover: "https://i0.wp.com/uxiaohan.github.io/v2/2024/07/1721643791.png"
recommend: true
---


## GIC 是什么
GIC (GPU Interrupt Controller) 是 ARM 架构中用于处理硬件中断的组件。

GICv3 是 GIC 的第三个版本，比起 GICv2 提供了更强大的功能和更高的性能。GICv3 主要用于多核处理器系统，支持更复杂的中断管理和分发。


## GICv3 的架构

下面是官方的 GICv3 架构图：

![](/assets/images/blog/arm-gicv3-basic/GICv3_arch.webp)


从 GICv3 的**组件视角**，可以发现 GICv3 主要由以下几个部分组成：
1. **Distributor**：负责将分发中断到各个 CPU 核心。
2. **Redistributor**：在多核系统中，Redistributor 用于管理和分发中断到各个 CPU 核心。
3. **CPU Interface**：每个 CPU 核心都有一个 CPU 接口，用于接收和处理中断。
4. **Interrupt Translation Service (ITS)**：用于处理虚拟化环境中的中断。

这些组件是 GICv3 的核心部分，负责中断的分发、处理和管理。

从**中断源的视角**来看，GICv3 支持多种中断源，包括：
1. **SPI (Shared Peripheral Interrupts)**：共享外设中断，通常用于外设设备。
    - SPI 是 GICv3 中最常用的中断类型，允许多个处理器共享同一个外设中断。
    - SPI 可以通过 Distributor 分发到不同的 CPU 核心。
    - 例如：串口、RTC、网络控制器等**共享外设**。

2. **PPI (Private Peripheral Interrupts)**：私有外设中断，通常用于处理器内部的中断。每个 PE 都有自己的 PPI。
    - PPI 是每个处理器核心私有的中断，通常用于处理器内部的事件。
    - 例如：定时器、看门狗等**私有外设**（设计在 SOC 内部）。

3. **SGI (Software Generated Interrupts)**：软件生成的中断，通常用于软件之间的通信。
    - SGI 是软件生成的中断，可以用于处理器之间的通信。
    - 例如：在多核系统中，一个核心可以向另一个核心发送 SGI 来通知它进行缓存同步或其他操作。

4. **LPI (Locality-Independent Interrupts)**：局部性无关中断，主要用于虚拟化环境。
    - LPI 是 GICv3 中新增的中断类型，主要用于虚拟化环境中的中断处理。
    - LPI 允许中断在不同的 CPU 核心之间动态分配，提高了中断处理的灵活性和效率。


从 **PE (Processing Element) 的视角**来看，我们发现 GICv3 并没有以 0，1，2，3 来标识 PE，而是使用了 Affinity 来标识 PE。Affinity 中文翻译为亲和度，一定程度上描述了不同处理器核心之间的亲和性。
Affinity 是一个 64 位的值，结构如下：

```
+----------------+----------------+----------------+----------------+
| Aff3 (8 bits)  | Aff2 (8 bits)  | Aff1 (8 bits)  | Aff0 (8 bits)  |
+----------------+----------------+----------------+----------------+
```

其中：
- Aff0：表示 CPU 核心的编号。（core）
- Aff1：表示 CPU 集群的编号。（cluster）
- Aff2：表示更高层次的集群编号。
- Aff3：通常为 0。

> **为什么要有 Affinity ？**  
以 RK3588 为例，RK3588 是一个 8 核的处理器，分为 4 个 Cortex-A76 的大核和 4 个 Cortex-A55 的小核，两个 Cluster 之间的通信延迟必然较大。可以用 Affinity 来有效区分大核和小核，从而实现更快速的中断处理。

## GICv3 的中断处理流程

![](/assets/images/blog/arm-gicv3-basic/GICv3_interrupt_flow.webp)

1. **中断产生（Generate interrupt）**：中断由外设或软件触发。

2. **中断分发（Distribute）**：中断路由接口（IRI）完成中断分组、优先级排序，并控制中断向 CPU 接口的转发。

3. **中断递交（Deliver）**：物理 CPU 接口将中断递交给对应的处理单元（PE）。

4. **中断激活（Activate）**：当 PE 上运行的软件确认（acknowledge）中断后，GIC 将当前最高活跃优先级设为被激活中断的优先级；对于 SPI、SGI 和 PPI，该中断状态变为 active。

5. **优先级下降（Priority drop）**：PE 上运行的软件通知 GIC：最高优先级中断已处理到可降低运行优先级的阶段。此时运行优先级恢复为中断确认前的值，这也是中断处理程序指示中断结束（End of Interrupt, EOI）的时刻。可通过配置让 EOI 同时执行中断去激活（deactivation），也可稍后通过显式去激活操作完成。

6. **中断去激活（Deactivation）**：去激活清除中断的 active 状态，使得该中断在再次处于 pending 状态时可被重新触发。

