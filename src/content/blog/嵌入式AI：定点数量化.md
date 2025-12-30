---
title: 嵌入式 AI：定点数量化
date: 2025-12-29 18:19:32
categories: Code
tags:
    - architecture

id: embedded-ai-fixed-point-quantization
cover: "https://i0.wp.com/uxiaohan.github.io/v2/2024/07/1721643791.png"
recommend: true
---

## 定点数量化（Fixed-Point Quantization）

在一些没有浮点单元（FPU）的处理器上运行神经网络模型时，用软件模拟浮点运算几乎是不可行的，想要满足在 MCU 上跑神经网络模型的需求，就必须使用定点数量化。本质上，这是将高精度浮点数（如FP32）转换为低精度定点数（如INT8或INT16）的过程，其核心思想是通过减少表示数值所需的位数，可以显著降低模型的存储需求和计算复杂度（浮点运算变整数运算）。

一个好消息是神经网络对于模型内部参数的精度不是特别的敏感，哪怕是使用 8 位定点数进行表示，模型的正确率的损失也在可接受范围内。

第一个思路，我们的想法就是将浮点数直接截断成整数部分，但是这样会损失小数部分的信息，但是这是不可接受的！网络参数的大部分信息都在小数部分中，如果直接截断成整数部分，那这个参数就变得毫无意义了。
$$
x = int(x_{float})
$$

那我们就继续深入，引入最简单的定点数来解决这个问题，我们设定一个缩放因子（scaling factor）$F$，表示小数点后面的位数，然后将浮点数乘以 $2^F$ 并四舍五入为整数：
$$
x_{fixed} = round(x_{float} \times 2^F)
$$

例如，如果我们选择 $F=8$，那么浮点数 $3.14159$ 将被转换为定点数 $804$（因为 $3.14159 \times 256 \approx 804$）。在计算过程中，我们需要记住这个缩放因子，以便在需要时将结果转换回浮点数：
$$
x_{float} = \frac{x_{fixed}}{2^F}
$$

将刚才的 $804$ 转换回浮点数：
$$
x_{float} = \frac{804}{2^8} = \frac{804}{256} \approx 3.140625
$$

通过这种方式，我们可以在保持一定精度的同时，大幅减少数据的存储和计算需求。

## 定点数的运算

在神经网络中，主要的运算是加法和乘法。在我们使用定点数进行运算时，百分之百会遇到**溢出**的问题，因为定点数的表示范围有限，8 位 * 8 位的乘法结果是 16 位的，如果继续用 8 位来存储结果，就会丢失高位信息，导致溢出。

不过在算子中溢出的问题好解决，我们只需要使用一个 32 位的累加器（accumulator）来存储中间结果，最后再将结果**重量化**回 8 位即可。

### 定点数加法

定点数的加法相对简单，只需要确保两个操作数具有相同的缩放因子 $F$，然后直接相加即可：

$$
z_{fixed} = x_{fixed} + y_{fixed}
$$

结果的缩放因子仍然是 $F$。

### 定点数乘法
定点数的乘法稍微复杂一些，因为乘法会导致缩放因子加倍。假设我们有两个定点数 $x_{fixed}$ 和 $y_{fixed}$，它们的缩放因子分别为 $F_x$, $F_y$，那么它们的乘积 $z_{fixed}$ 可以表示为：

$$
z_{fixed} = \frac{x_{fixed} \times y_{fixed}}{2^{F_x + F_y}}
$$

最终的缩放因子是 $F_x + F_y$。

### 重量化（Requantization）

在神经网络的推理过程中，经过多次乘法和加法运算后，结果的位宽可能会增加，因此需要将结果重新量化回较低的位宽（如 8 位）。这个过程称为重量化（Requantization）。

这个过程本质上就是一个右移操作，同时可能需要进行舍入以减少量化误差：
$$
x_{fixed\_8bit} = round\left(\frac{x_{fixed}}{2^R}\right)
$$

举个例子，有两个 8 位定点数相乘，假设 $F_x = 4$，$F_y = 4$，$x_{fixed} = 50$，$y_{fixed} = 60$。那么对应的浮点数为：

$$
x_{float} = \frac{50}{2^4} = \frac{50}{16} = 3.125
$$

$$
y_{float} = \frac{60}{2^4} = \frac{60}{16} = 3.75
$$

它们的乘积是：
$$
z_{float} = x_{float} \times y_{float} = 3.125 \times 3.75 = 11.71875
$$

此时 $x_{fixed} \times y_{fixed} = 50 \times 60 = 3000$ （8 位定点数的最大值为 127），所以我们需要将结果重量化回 8 位：
$$
z_{fixed\_8bit} = round\left(\frac{3000}{2^{4 + 4 + R}}\right)
$$

其中 $R$ 是我们选择的右移位数，以确保结果适合 8 位表示。假设我们选择 $R = 4$，那么：
$$
z_{fixed\_8bit} = round\left(\frac{3000}{2^{8}}\right) = round\left(\frac{3000}{256}\right) \approx round(11.71875) = 12
$$

最后，得到的缩放因子为 $F_z = F_x + F_y + R = 4 + 4 + 4 = 12$。

## 例子：线性层

下面是一个简单的线性层（全连接层）在浮点数和定点数下的实现对比：

```py
import numpy as np
def fc_f32(
    input_data: np.ndarray,  # shape (in_features)
    weights: np.ndarray,  # shape (out_features, in_features)
    bias: np.ndarray,  # shape (out_features)
) -> np.ndarray:
    """float32 fully connected layer"""
    return (weights @ input_data) + bias

def fc_i8(
    input_data: np.ndarray,  # shape (in_features)
    weights: np.ndarray,  # shape (out_features, in_features)
    bias: np.ndarray,  # shape (out_features)
    bias_shift: int,
    out_shift: int,
) -> np.ndarray:
    """int8 fully connected layer"""
    # 使用 int32 累加避免溢出
    input_i32 = input_data.astype(np.int32)
    weights_i32 = weights.astype(np.int32)

    round_const = (1 << out_shift) >> 1 if out_shift > 0 else 0

    # 主运算：矩阵乘向量
    acc = weights_i32 @ input_i32  # shape (out_features)
    # 偏置（若存在）并左移
    if bias is not None:
        acc = acc + (bias.astype(np.int32) << bias_shift)
    
    # 加上舍入常数并右移
    acc = (acc + round_const) >> out_shift
    # 饱和到 int8 范围
    acc = np.clip(acc, -128, 127)
    return acc.astype(np.int8)
```

在这个例子中，`fc_f32` 函数实现了一个使用浮点数的全连接层，而 `fc_i8` 函数实现了一个使用定点数（INT8）的全连接层。注意在 `fc_i8` 中，我们使用了一个 32 位的累加器来存储中间结果，并在最后进行了重量化和饱和处理，以确保结果适合 8 位表示。

在这里，我们要遵守定点数的运算规则，现在简单列一下方程：
- 输入数据、权重和偏置都是定点数，具有各自的缩放因子 $F_{i}$、$F_{w}$ 和 $F_{b}$。
- 累加结果的缩放因子为 $F_{acc} = F_{i} + F_{w}$。
- 最终重量化时，我们需要选择合适的右移位数 $R$，使得输出的范围在 [-128, 127] 内，那最后输出的缩放因子为 $F_{out} = F_{acc} + R$。

利用这几个公式，可以计算出具体的 `bias_shift` 和 `out_shift` 值，其中 `bias_shift = F_{i} + F_{w} - F_{b}`，`out_shift = F_{i} + F_{w} - F_{out}`。

### 权重和偏置的量化

现在具体来看一下如何量化权重和偏置，这里使用了最朴素的方法，通过数据的最大/最小值来估算定点量化所需的小数位(dec bits)：

```py
def find_dec_bits(data, bit_width=8, maximum_bit=32) -> int:
    """
    通过数据的最大/最小值来估算定点量化所需的小数位(dec bits)，不做饱和裁剪。
    参数:
        data        : 待分析的数据
        bit_width   : 目标量化的总位宽(含符号位)，默认 8bit
        maximum_bit : 小数位的上限，防止偏置等极小值导致 dec bits 过大
    返回:
        估算得到的小数位(dec bits)，不会超过 maximum_bit
    """
    # 留出极小的饱和裕量，避免因单个极值导致溢出
    max_val = abs(data.max()) - abs(data.max() / pow(2, bit_width))
    min_val = abs(data.min()) - abs(data.min() / pow(2, bit_width))

    # 需要的整数位数(含符号位)，向上取整到 2 的幂次
    int_bits = int(np.ceil(np.log2(max(max_val, min_val))))

    # 总位宽 = 符号位(1) + 整数位 + 小数位，因此小数位 = (bit_width - 1) - 整数位
    dec_bits = (bit_width - 1) - int_bits

    # 若计算结果过大，则以 maximum_bit 为上限
    return min(dec_bits, maximum_bit)


def quantize_weights(weights: np.ndarray, bias: np.ndarray) -> tuple[np.ndarray, np.ndarray, int, int]:
    """量化权重和偏置"""
    # 估算权重和偏置所需的小数位
    weight_dec_bits = find_dec_bits(weights)
    bias_dec_bits = find_dec_bits(bias)

    # 量化权重和偏置
    weights_q = np.clip(np.round(weights * pow(2, weight_dec_bits)), -128, 127).astype(np.int8)
    bias_q = np.clip(np.round(bias * pow(2, bias_dec_bits)), -128, 127).astype(np.int8)

    return weights_q, bias_q, weight_dec_bits, bias_dec_bits
```

在这个例子中，`find_dec_bits` 函数通过分析数据的最大和最小值来估算所需的小数位数，而 `quantize_weights` 函数则使用这个信息将权重和偏置量化为 INT8 格式。

利用上面的函数，我们可以完成一个简单的定点量化和推理流程，值得一提的是，对于 $F_{out}$ 的选择，必须根据 f32 推理的输出范围来决定，以确保量化后的结果不会溢出。

```py
# 1. 定义全连接层
in_features = 10
out_features = 5

weights = np.random.randn(out_features, in_features).astype(np.float32)
bias = np.random.randn(out_features).astype(np.float32)
input_data = np.random.randn(in_features).astype(np.float32)

# 2. 浮点推理并计算输出所需小数位
output_float = fc_f32(input_data, weights, bias)
output_dec_bits = find_dec_bits(output_float)

# 3. 量化权重和偏置
weights_q, bias_q, weight_dec_bits, bias_dec_bits = quantize_weights(weights, bias)
print("Quantized weights: \n", weights_q)
print("Quantized bias: ", bias_q)
print("Weight dec bits: ", weight_dec_bits)
print("Bias dec bits: ", bias_dec_bits)

# 4. 量化输入数据
input_data_q = np.clip(np.round(input_data * pow(2, weight_dec_bits)), -128, 127).astype(np.int8)
print("Quantized input data: ", input_data_q)

# 5. 整数推理
in_dec_bits = weight_dec_bits  # 输入数据和权重使用相同的小数位
out_shift = in_dec_bits + weight_dec_bits - output_dec_bits
fc_i8_output = fc_i8(
    input_data_q,
    weights_q,
    bias_q,
    bias_shift=in_dec_bits + weight_dec_bits - bias_dec_bits,  # 偏置左移位数
    out_shift=out_shift,
)
print("Int8 output: ", fc_i8_output)

# 6. 反量化整数输出
output_dequantized = fc_i8_output.astype(np.float32) / pow(2, in_dec_bits + weight_dec_bits - out_shift)
print("Dequantized output: ", output_dequantized)
print("Float output: ", output_float)
print("Difference: ", output_float - output_dequantized)
```

运行结果如下，显示了量化后的权重、偏置、输入数据，以及整数推理的输出和反量化后的结果与浮点输出的差异，可以看到差异非常小，说明定点量化在这个例子中效果良好：

```sh
➜  nn_backend git:(main) ✗ python main.py
Quantized weights:
 [[ -12 -101  -19  -48   24   24  -71  -19  -29  -42]
 [ -12  -23   19  -23   -1  -20  -35   -6   17  -10]
 [  49   59    0  -86  -59  -38   11   18  -44  -12]
 [  70   61  -61  -38  -21   -8  -16  -41   36  -40]
 [   5   24   54   20    7   27   51  -27  -65   10]]
Quantized bias:  [  7  68  14  15 -61]
Weight dec bits:  5
Bias dec bits:  6
Quantized input data:  [  4 -10  21  12  48  -6 -28 -30 -23  77]
Int8 output:  [ 17  23 -71 -78  31]
Dequantized output:  [ 1.0625  1.4375 -4.4375 -4.875   1.9375]
Float output:  [ 0.9955722  1.436913  -4.5120335 -4.9752207  1.9657626]
Difference:  [-0.06692779 -0.00058699 -0.07453346 -0.10022068  0.02826262]
```

## 参考资料

- [nnom: A higher-level Neural Network library for microcontrollers](https://github.com/majianjia/nnom)
- [CMSIS-NN: Efficient Neural Network Kernels for Arm Cortex-M CPUs](https://arxiv.org/abs/1801.06601)
